# WhatsApp lead alerts

When someone submits the contact form, the backend sends a WhatsApp message to the site owner's phone so leads aren't missed. This doc covers the provider options that were considered, why CallMeBot was picked, and exactly how to set it up (locally, on the AWS box, or later in production).

## How it works (implementation summary)

- `backend/leads/whatsapp.py` builds a plaintext lead summary and sends it via a background thread so a slow/failed WhatsApp API call never delays or breaks the visitor's form submission.
- `ContactSubmissionViewSet.perform_create` (`backend/leads/views.py`) triggers it right after the lead is saved to Postgres.
- It's outbound-only (a single HTTP GET to the provider) — no inbound webhook, no public domain or deployment required to test it.
- If the required env vars are missing, it silently no-ops (logs an INFO line) instead of erroring — safe for CI/fresh clones.

## Options considered (free tiers)

| Option | Setup effort | Official? | Notes |
|---|---|---|---|
| **CallMeBot** (chosen) | ~5 min, one WhatsApp message | No — community/unofficial | Fully free, no business account, single HTTP GET per message. Soft rate limit (~1 msg/20s). Good enough for a personal lead-alert use case. |
| **Twilio WhatsApp Sandbox** | ~15–20 min | Yes (sandbox is official Twilio) | Free trial credit. Sandbox messages are prefixed and the session expires after 24h idle, so you re-join periodically while testing. Clear upgrade path to a paid production sender later. |
| **Meta WhatsApp Cloud API** | 30–60+ min | Yes — the real production API | Free tier: 1,000 conversations/month. Requires a Meta Business account, an app in Meta for Developers, phone number verification, and token refresh handling. The right choice *if* this ever needs to be a verified business sender, but overkill just to get alerts to your own phone. |

### Process for each option

**CallMeBot** (what's implemented now):
1. Save `+34 644 51 74 87` as a WhatsApp contact.
2. Send it the message: `I allow callmebot to send me messages`.
3. Wait for its reply containing your personal API key.
4. Use that key + your phone number as described in "How to connect" below.

**Twilio WhatsApp Sandbox** (not implemented, documented for reference):
1. Create a free Twilio account, open the WhatsApp Sandbox page in the Twilio Console.
2. From your WhatsApp, send the shown `join <sandbox-code>` phrase to Twilio's sandbox number.
3. Grab your Account SID + Auth Token from the console, and the sandbox `from` number.
4. Call Twilio's REST API (`POST /2010-04-01/Accounts/{SID}/Messages.json`) with `From`, `To` (your WhatsApp number, `whatsapp:+91...`), and `Body`.
5. Re-send the join code whenever the sandbox session expires (24h of inactivity).

**Meta WhatsApp Cloud API** (not implemented, documented for reference):
1. Create a Meta Business account and an app at developers.facebook.com, add the WhatsApp product.
2. Verify a phone number (Meta provides a free test number for development).
3. Generate a temporary (or System User) access token.
4. Call the Cloud API's `/messages` endpoint with a template or free-form message (free-form only works within a 24h customer-initiated session window — for pure outbound alerts you'd typically need an approved message template).
5. Handle token expiry/refresh for anything beyond short-lived testing.

## How to connect (CallMeBot — what's actually wired up)

### 1. One-time WhatsApp opt-in
On the phone that should receive lead alerts:
1. Save `+34 644 51 74 87` as a contact.
2. WhatsApp it: `I allow callmebot to send me messages`.
3. Wait for the reply with your personal API key (usually seconds, occasionally a couple minutes).

### 2. Set the two env vars
The integration reads:
- `CALLMEBOT_API_KEY` — the key from step 1.
- `WHATSAPP_ALERT_PHONE` — the phone number to alert, international format (e.g. `+91XXXXXXXXXX`), same number used for opt-in.

Where to put them, depending on how you're running the backend:

- **Dockerized local/dev (`docker-compose.yml`)** — this file hardcodes env values (doesn't read `backend/.env`), so edit the `backend.environment` block directly:
  ```yaml
  - CALLMEBOT_API_KEY=<your key>
  - WHATSAPP_ALERT_PHONE=<your number>
  ```
- **Bare `manage.py runserver`** — copy `backend/.env.example` to `backend/.env` (gitignored) and fill in the same two vars there.
- **AWS EC2 (free tier) instance** — run the same `docker-compose.yml` stack on the instance with the values filled in as above. No domain or public URL needed since this is outbound-only.
- **Production (`docker-compose.prod.yml`)** — already wired to read `${CALLMEBOT_API_KEY}` / `${WHATSAPP_ALERT_PHONE}` from whatever secret store/CI env populates that file's other secrets (e.g. `${DJANGO_SECRET_KEY}`) — add the two values there once a real deploy pipeline exists.

### 3. Rebuild/restart the backend
`requests` was added as a new dependency, so a plain restart isn't enough if the image hasn't been rebuilt:
```bash
docker compose up -d --build backend
```
or, for bare `runserver`: `pip install -r requirements.txt` then restart.

### 4. Trigger a test message
Either submit the real contact form (Vite dev server, or the Dockerized frontend at `localhost:8080`), or skip the UI:
```bash
curl -X POST http://localhost:8001/api/contact/ \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"+911234567890","service":"Test Shoot","message":"hello"}'
```

### 5. Confirm
The WhatsApp message should arrive within a few seconds. If it doesn't, check the backend logs:
```bash
docker compose logs backend
```
Look for `WhatsApp alert failed to send via CallMeBot` (bad key, rate limit, network issue) or `WhatsApp alert skipped` (env vars not picked up).

### Known limits
CallMeBot's free tier has a loose rate limit (roughly one message per ~20s per number) — leave a short gap between repeated test submissions.
