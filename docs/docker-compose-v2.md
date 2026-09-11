# `docker-compose.yml` v2 — Production-only

This documents the current [`docker-compose.yml`](../docker-compose.yml). It supersedes
[`docker-compose.md`](./docker-compose.md), which described an earlier version of the file with
separate hot-reload `dev`/`backend-dev` services alongside the production ones. Those are gone —
this file now runs **only** the production path, with three services: `db`, `backend`, `frontend`.

If you need local hot-reload development (editing code with instant reflect, without rebuilding
images), that workflow no longer lives in this compose file — see the note at the bottom.

## Service by service

### `db`

Postgres, pulled as a public image (`postgres:16-alpine`) — no custom build needed.

- `environment`: sets the DB name/user/password. Postgres's official image reads these on first
  startup to create that database and user.
- `volumes: pgdata:/var/lib/postgresql/data`: a **named volume** (declared at the bottom of the
  file) — Docker manages this storage itself, separate from the project folder, so the data
  survives `docker compose down` (it only vanishes if you explicitly run `docker compose down -v`).
- `ports: "5434:5432"`: `host:container` — Postgres always listens on `5432` inside its container;
  mapped to host port `5434` to avoid clashing with other local Postgres instances.

### `backend`

`build: ./backend` builds [`backend/Dockerfile`](../backend/Dockerfile) — installs system deps
(`libpq-dev`, `gcc` for `psycopg2`) and Python packages from `requirements.txt`, copies the Django
project in, and runs it via `gunicorn` (the Dockerfile's default `CMD`). No volume mount: the code
is baked into the image, matching a real deployment — to ship a change, rebuild the image rather
than editing a running container.

- `environment`: configures [`backend/config/settings.py`](../backend/config/settings.py) —
  `DJANGO_DEBUG=False` for production, `POSTGRES_HOST=db` so Django finds the database *by its
  Compose service name* (Docker's internal DNS resolves `db` to that container automatically, no
  manual networking needed), and `CORS_ALLOWED_ORIGINS` naming the frontend's origin.
- `ports: "8001:8000"`: lets you reach the API and Django admin directly at
  `http://localhost:8001/`, independent of the frontend's proxy below.
- `depends_on: db`: starts `db` first. Only controls startup *order*, not readiness — the
  container's entrypoint (`backend/entrypoint.sh`) handles waiting for Postgres to actually accept
  connections before running migrations.

### `frontend`

`build: ./frontend` runs [`frontend/Dockerfile`](../frontend/Dockerfile)'s multi-stage build:
`npm run build` produces static files, which get copied into an `nginx` image. No volume mount
here either — same reasoning as `backend`.

- `ports: "8080:80"`: the site is served at `http://localhost:8080/`.
- `depends_on: backend`: starts `backend` first (again, just ordering).
- **The `/api/` reverse proxy**: [`frontend/nginx.conf`](../frontend/nginx.conf) has a
  `location /api/ { proxy_pass http://backend:8000/api/; ... }` block. This is what lets the React
  app call same-origin `/api/...` paths — nginx forwards those requests to the `backend` service
  over Docker's internal network — so the browser never needs to know about CORS or a different
  port. **This is why the service must be named exactly `backend`**: nginx resolves that hostname
  via Docker's DNS, so if you rename the service in `docker-compose.yml`, you must update
  `nginx.conf`'s `proxy_pass` to match, or every API call will fail with a 502.

### `volumes:` (top-level)

Declares `pgdata` as a named volume so Compose persists it (referenced by `db`'s mount above)
rather than treating it as throwaway container storage.

## Typical usage

```bash
docker compose up -d --build   # build images and start everything
docker compose logs backend -f # tail Django's logs
docker compose down            # stop everything (keeps the database)
```

## What happened to local dev (hot reload)?

The old `dev`/`backend-dev` services bind-mounted the source folders and ran `vite`/`runserver`
directly, so edits on disk reflected instantly without rebuilding an image. That workflow was
removed from this file to keep it strictly production-shaped. If you need it back, see the git
history for `docker-compose.yml` prior to the production-only rename, or recreate equivalent
services following the same bind-mount pattern the `backend`/`frontend` services here use for
`build:` — just add `volumes: - ./backend:/app` (or `./frontend:/app`) and override `command:` to
run the dev server instead of gunicorn/nginx.
