# CD Deployment: How a Push Actually Reaches Production

This documents the CD pipeline **as actually built and running**, not the original design sketch in
[`cicd-pipeline.md`](./cicd-pipeline.md) — a few things changed along the way (polling instead of a
webhook, no `:latest` tag, deploying straight to one box rather than staging+production). Where this
doc and `cicd-pipeline.md` disagree, this one reflects reality.

## The flow, end to end

```
git push to main
        │
        ▼
GitHub Actions (.github/workflows/ci.yml)
  lint + test → build both images → push to GHCR, tagged ONLY by commit SHA
        │
        │  (no webhook — Jenkins finds out by polling, up to ~2 min later)
        ▼
Jenkins (Poll SCM, every 2 minutes) detects the new commit on main
        │
        ▼
Jenkinsfile runs:
  1. Log in to GHCR
  2. Wait for images   — polls GHCR until both SHA-tagged images actually exist
  3. Pull images
  4. Deploy             — docker compose -f docker-compose.prod.yml up -d
  5. Health check        — curl http://localhost/
        │
        ▼
Live site updated (frontend on :80, backend on :8001, both via the same nginx origin)
```

## Why polling instead of a webhook

[`cicd-pipeline.md`](./cicd-pipeline.md) originally sketched a GitHub → Jenkins webhook. What's
actually configured is **Poll SCM** instead (`H/2 * * * *` — roughly every 2 minutes), set directly
in the Jenkins job's Build Triggers. This is a legitimate alternative, not a shortcut:

- **Webhook**: near-instant trigger, but requires Jenkins to be reachable from the public internet
  (GitHub has to be able to reach it), plus a shared secret to verify payloads aren't forged.
- **Polling**: up to ~2 minutes of latency, and Jenkins does a small amount of work every 2 minutes
  whether or not anything changed — but needs zero inbound networking configuration.

Given this Jenkins instance already has port 8080 open to the internet (needed for the browser UI
anyway), a webhook would work fine here too — polling was simply the choice made. Switching later
just means: add the webhook in GitHub repo settings, then change the job's Build Trigger from Poll
SCM to "GitHub hook trigger for GITScm polling."

## The race condition polling creates, and how the Jenkinsfile handles it

Polling finds out about a new commit purely from git history — it has no idea whether GitHub
Actions has *finished* building and pushing images for that commit yet. Without handling this,
Jenkins could poll, see the new commit, and try to deploy an image that doesn't exist in GHCR yet.

The **"Wait for images"** stage in the `Jenkinsfile` solves this:

```groovy
stage('Wait for images') {
    steps {
        sh '''
            for i in $(seq 1 30); do
                if docker manifest inspect ${IMAGE_BASE}-backend:${GIT_COMMIT} >/dev/null 2>&1 &&
                docker manifest inspect ${IMAGE_BASE}-frontend:${GIT_COMMIT} >/dev/null 2>&1; then
                    echo "Both images are available for ${GIT_COMMIT}"
                    exit 0
                fi
                echo "Images not available yet. Waiting 20 seconds..."
                sleep 20
            done
            echo "Images were not published for ${GIT_COMMIT}"
            exit 1
        '''
    }
}
```

`docker manifest inspect` checks whether a tag exists in the registry without pulling it — cheap to
poll repeatedly. This retries every 20 seconds for up to 10 minutes before giving up and failing the
build. `${GIT_COMMIT}` is a variable Jenkins's Git plugin sets automatically to the full SHA of
whatever commit was checked out — the same identifier CI uses as the image tag, so the two systems
correlate "this commit" to "this image" without any manual coordination.

This stage exists specifically *because* this pipeline uses polling — a webhook fired only after CI
finishes wouldn't have this race at all, since by construction the image would already exist by the
time Jenkins hears about it.

## Jenkinsfile, stage by stage

```groovy
environment {
    REGISTRY   = 'ghcr.io'
    IMAGE_BASE = 'ghcr.io/utkarshgayguwal/himanshu-photography'
    DJANGO_SECRET_KEY = credentials('django-secret-key')
    POSTGRES_PASSWORD = credentials('postgres-password')
}
```

`credentials(...)` pulls a Secret Text credential from Jenkins's credential store and exposes it as
an environment variable for every stage — these values never appear in the repo, in `docker-compose.prod.yml`,
or baked into any image.

**Login to GHCR** — uses a third credential (`ghcr-creds`, Username/Password: GitHub username + a
PAT with `read:packages`) to authenticate `docker pull` against a private registry.

**Pull images** — pulls both SHA-tagged images now that "Wait for images" confirmed they exist.

**Deploy**:
```groovy
stage('Deploy') {
    environment {
        BACKEND_TAG  = "${GIT_COMMIT}"
        FRONTEND_TAG = "${GIT_COMMIT}"
    }
    steps {
        sh 'docker compose -f docker-compose.prod.yml up -d'
    }
}
```
Sets `BACKEND_TAG`/`FRONTEND_TAG` for this stage only, which `docker-compose.prod.yml` substitutes
into its `image:` lines (see below). `docker compose up -d` only recreates containers whose
resolved image actually changed — `db` stays untouched on every deploy.

**Health check** — `curl -f http://localhost/`. `-f` makes curl itself fail (non-zero exit) on a
4xx/5xx response, which fails the Jenkins stage — a deploy that returns errors is treated as a
failed build, not a silent success.

**`post` block**:
```groovy
post {
    failure {
        echo 'Deploy failed — check the stage logs above. The previous containers are still running...'
    }
    always {
        sh 'docker image prune -f'
    }
}
```
On failure, the *previous* containers are still running — `docker compose up -d` doesn't tear down
the old ones until the new ones are confirmed started, so a failed deploy doesn't take the live site
down with it. `docker image prune -f` runs after every build regardless of outcome, clearing
dangling image layers left behind by each new pull (see [`server-cleanup.md`](./server-cleanup.md)
for the fuller disk-management picture).

## `docker-compose.prod.yml`, what changed from the first draft

```yaml
frontend:
  image: ghcr.io/utkarshgayguwal/himanshu-photography-frontend:${FRONTEND_TAG}
  ports:
    - "80:80"
```

**Frontend now serves on port 80**, not 8080. The first draft used 8080 to avoid clashing with
anything else during initial testing; port 80 is what a real domain actually needs (`http://yourdomain.com`
implies port 80 — forcing visitors to type `:8080` isn't acceptable for a real site). This also
means the security group needs an inbound rule for port 80, not 8080, for public traffic (8080 stays
needed only for Jenkins's own UI, restricted to your IP).

```yaml
backend:
  image: ghcr.io/utkarshgayguwal/himanshu-photography-backend:${BACKEND_TAG}
  ...
  environment:
    - CORS_ALLOWED_ORIGINS=${PUBLIC_ORIGIN:-http://localhost}
```

`BACKEND_TAG`/`FRONTEND_TAG` **no longer have compose-level defaults** (`${VAR}`, not
`${VAR:-latest}`) — deliberately: since CI stopped pushing a `:latest` tag, a missing tag here should
fail loudly (`docker compose up` errors on an unset required variable) rather than silently trying
to pull a tag that no longer exists. `CORS_ALLOWED_ORIGINS` still defaults to `http://localhost`
via `PUBLIC_ORIGIN` — update `PUBLIC_ORIGIN` once the real domain is live, though in practice this
matters little since nginx proxies `/api/` same-origin (CORS only applies to cross-origin requests
in the first place).

## nginx: now also proxying `/admin/` and `/static/`

The original `frontend/nginx.conf` only proxied `/api/`. It's since grown two more blocks:

```nginx
location /admin/ {
    proxy_pass http://backend:8000/admin/;
    ...
}
location /static/ {
    proxy_pass http://backend:8000/static/;
    ...
}
```

Without `/static/`, the Django admin would load at `/admin/` but render unstyled — its CSS/JS is
served by whitenoise on the backend at paths like `/static/admin/css/base.css`, and those requests
need the same proxy treatment as `/admin/` itself, or nginx 404s them before they ever reach
Django. With both blocks in place, the admin panel is fully usable at `http://<host>/admin/`
through the same origin as the site itself — no need to know about the backend's separate `:8001`.

## Jenkins job configuration (as actually created)

- Name: `himanshu-photography`, type: **Pipeline**
- Pipeline: **Pipeline script from SCM** → Git → `https://github.com/utkarshgayguwal/himanshu-photography.git`,
  branch `*/main`, script path `Jenkinsfile`
- Build Triggers: **Poll SCM**, schedule `H/2 * * * *`

Credentials required (Manage Jenkins → Credentials → System → Global), same three as originally
planned:

| Kind | ID | Value |
|---|---|---|
| Username with password | `ghcr-creds` | GitHub username + PAT with `read:packages` |
| Secret text | `django-secret-key` | Real production Django secret key |
| Secret text | `postgres-password` | Real production Postgres password |

## Manual deploy / rollback

Since there's no `IMAGE_TAG` parameter anymore (deploys always follow whatever commit Jenkins
polled), rolling back means either:

- `git revert` the bad commit and push — Jenkins polls, sees a new commit, deploys it normally, or
- Manually, on the server: `BACKEND_TAG=<old-sha> FRONTEND_TAG=<old-sha> docker compose -f docker-compose.prod.yml up -d`
  using a commit SHA from before the bad deploy — works as long as GHCR hasn't garbage-collected
  that tag.
