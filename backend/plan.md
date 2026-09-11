# Backend plan: data to move out of the frontend

Inventory of data currently hardcoded in the React frontend (`frontend/`) that should eventually
be served from this Django backend instead. Work through these one at a time — check off `[x]`
as each is implemented (model + admin + API endpoint + frontend wired to call it).

**Status (2026-09-12):** Django backend implemented — apps `content` (Service, PortfolioImage,
Testimonial, Stat, PhilosophyValue, Achievement, AboutContent, SiteSettings) and `leads`
(ContactSubmission), all with admin registration, DRF serializers/endpoints under `/api/`, and
seeded with the site's current content (`python manage.py seed_content`, idempotent). Dockerized
as `backend-dev`/`backend-prod` + a `db` (Postgres) service in the root `docker-compose.yml`.
Tested end-to-end: all GET endpoints verified, admin CRUD + singleton add-restriction verified,
`POST /api/contact/` verified via curl and a real browser submission through the full stack
(nginx → gunicorn → Postgres). Per your call, only the **Contact form** was also wired up on the
frontend this round — Home/Services/Work/About/Footer intentionally stay hardcoded for now
(matching "keep frontend as-is") and are marked "backend done" below rather than checked off,
since this file's own done-criteria (model + admin + API **+ frontend wired**) isn't fully met
for those yet.

## A. Needs a real backend endpoint (not just content storage)

- [x] **Contact / booking form** — `frontend/src/pages/Contact.jsx` (`handleSubmit`). Now `POST`s
  to `/api/contact/` (proxied same-origin via Vite in dev / nginx in prod — see `leads/views.py`,
  `leads/models.py`). Shows a "Sending..." state and an inline error message on failure. Verified
  with a real browser submission that landed in Postgres.

## B. Content that should become backend-managed (CRUD via Django admin, served over an API)

- [ ] **Services offered** *(backend done)* — model `content.Service`, endpoint `GET /api/services/`
  (9 seeded). `frontend/src/pages/Services.jsx:32-114` still hardcodes its own copy — not wired.
- [ ] **Services preview (Home)** *(backend done via `Service.is_featured`)* — 3 services flagged
  featured (wedding, baby, candid) for whenever Home.jsx's preview gets wired to this instead of
  its own separate array.
- [ ] **Portfolio/gallery images** *(backend done)* — model `content.PortfolioImage`, endpoint
  `GET /api/portfolio/` (30 seeded, matching `Work.jsx`'s `localImages`/`unsplashImages`). Not wired.
- [ ] **Gallery preview (Home)** *(backend done via `PortfolioImage.is_featured`)* — the same 6
  images `Home.jsx`'s `GALLERY_IMAGES` uses today are flagged featured with matching `label`/`aspect`.
- [ ] **Stats / achievements banner (Home)** *(backend done)* — model `content.Stat`, endpoint
  `GET /api/stats/` (4 seeded). Not wired.
- [ ] **Testimonials** *(backend done)* — model `content.Testimonial`, endpoint
  `GET /api/testimonials/` (3 seeded). Not wired.
- [ ] **About — Philosophy/values** *(backend done)* — model `content.PhilosophyValue`, endpoint
  `GET /api/philosophy/` (3 seeded). Not wired.
- [ ] **About — Achievements/recognition timeline** *(backend done)* — model `content.Achievement`,
  endpoint `GET /api/achievements/` (5 seeded). Not wired.
- [ ] **About — bio & story text** *(backend done)* — singleton model `content.AboutContent`,
  endpoint `GET /api/about/`. Not wired.

## C. Site-wide business info (a single "settings" record, not a list)

- [ ] **Contact details (phone, email, address)** *(backend done)* — singleton model
  `content.SiteSettings`, endpoint `GET /api/settings/`. Seeded with the canonical
  `contact@himanshuphotography.com`, fixing the two-different-emails bug found while inventorying
  — but only in the backend record; `Contact.jsx` and `Footer.jsx` still hardcode their own copies
  (Footer's social-icon link still has the wrong `himanshu@photography.com`) until wired.
- [ ] **Social links** *(backend fields exist: `instagram_url`, `facebook_url`, both blank)* —
  `frontend/src/components/Footer.jsx`'s placeholder/dead links are unchanged; still needs real
  URLs once you have them, and wiring to read from `SiteSettings`.
- [ ] **Google Maps embed URL** *(backend done, part of `SiteSettings.map_embed_url`)* — not wired.
- [ ] **Footer tagline / copyright text** *(backend done, part of `SiteSettings`)* — not wired;
  still lowest priority per the original note.

## Not worth moving

- **Navbar links** (`frontend/src/components/Navbar.jsx`) — routing structure, not content.
- **One-off hero image URLs** on Services/About/Work/Home — used once each, purely decorative
  backdrops. Low value to make dynamic unless hero images should also be swappable from admin;
  optional/low-priority, not recommended outright.
