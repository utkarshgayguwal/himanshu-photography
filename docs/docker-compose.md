# Understanding `docker-compose.yml`

This explains how the root [`docker-compose.yml`](../docker-compose.yml) is put together — service by
service, and why the backend services look different from the frontend ones.

## `image:` vs `build:` — the key difference

- **`dev`** (frontend): `image: node:20-alpine` — pulls Node's official public image as-is. No
  customization needed: it just needs a bare Node.js environment, then mounts the source code into
  it and runs `npm install && npm run dev` at startup. There's no Dockerfile for the frontend dev
  mode because nothing needs pre-baking.
- **`backend-dev` / `backend-prod`**: `build: ./backend` — instead of naming a public image, this
  tells Compose "build a custom image from the Dockerfile in `./backend`". The `python:...` base
  image *is* there — it's just one layer down, in [`backend/Dockerfile`](../backend/Dockerfile)'s
  first line (`FROM python:3.12-slim`), not spelled out in `docker-compose.yml` itself. Compose
  builds that Dockerfile into a new image (tagged `himanshu-photography-docker-backend-dev` /
  `himanshu-photography-backend:prod`) and runs *that*.

Why the backend needs `build` but the frontend `dev` doesn't: the backend image needs
`apt-get install libpq-dev gcc` (for `psycopg2`) and `pip install -r requirements.txt` baked in
ahead of time — that's custom enough to need a Dockerfile. The frontend `dev` service just needs a
stock Node.js and installs its own dependencies at container startup via `npm install`, so no
custom image is worth building.

## Service by service

### `db`

Postgres, pulled as a public image (`postgres:16-alpine`), no custom build needed either.

- `environment`: sets the DB name/user/password — Postgres's official image reads these on first
  startup to create that database and user.
- `volumes: pgdata:/var/lib/postgresql/data`: a **named volume** (declared at the bottom of the
  file) — Docker manages this storage itself, separate from the project folder, so the data
  survives `docker compose down` (it only vanishes if you explicitly run `docker compose down -v`).
- `ports: "5434:5432"`: `host:container` — Postgres always listens on `5432` inside its container;
  it's mapped to host port `5434` to avoid clashing with other local Postgres instances.

### `dev` (frontend, hot-reload mode)

- `volumes: ./frontend:/app`: a **bind mount** — the actual `frontend/` folder on disk is mounted
  straight into the container at `/app`, so any edit made on the host machine is instantly visible
  inside the container (that's what gives hot reload).
- `/app/node_modules` (no host path before the colon): an **anonymous volume** — this deliberately
  *shields* `node_modules` inside the container from the bind mount above, so the container uses
  the Linux-built dependencies it installed itself rather than the host's (which might be
  macOS/Windows-built and incompatible).
- `depends_on: backend-dev`: controls *startup order* (start `backend-dev` first) — it doesn't wait
  for Django to be fully ready, just for the container to start.

### `prod` (frontend, production mode)

`build: ./frontend` runs `frontend/Dockerfile` (the multi-stage build: `npm run build` → copy the
static output into an `nginx` image). No volume mount here — the built files are baked into the
image, matching a real deployment (rebuild the image to ship a change, rather than editing running
code).

### `backend-dev`

Same hot-reload pattern as frontend `dev`: bind-mounts `./backend:/app` so editing a `.py` file on
the host is picked up immediately, and Django's `runserver` auto-reloads on file changes. The
`environment` block is how [`backend/config/settings.py`](../backend/config/settings.py) gets
configured — e.g. `POSTGRES_HOST=db` tells Django to connect to the `db` service *by its Compose
service name* (Docker's internal DNS resolves `db` to that container's IP on the shared network
Compose creates automatically — no manual networking setup needed).

### `backend-prod`

Same idea as frontend `prod`: no volume mount, code is baked into the built image via
`backend/Dockerfile`, `DJANGO_DEBUG=False`, and it runs `gunicorn` instead of `runserver` (that's
the default `CMD` in `backend/Dockerfile` — this service doesn't override `command:`, unlike
`backend-dev` which does).

### `volumes:` (top-level)

Declares `pgdata` as a named volume so Compose knows to persist it (referenced by `db`'s mount
above) rather than treating it as throwaway container storage.

## Worth knowing

Both `backend-dev` and `backend-prod` build from the *same* `backend/Dockerfile` (that's why both
say `build: ./backend`) — they just differ in `command:`, `environment:`, and whether a volume is
mounted. Compose builds two separate images from it since they're tagged/configured differently.
