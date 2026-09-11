# Commonly Used Commands

Commands for working with this project day-to-day. Everything runs through Docker — there's no
local Python/Node install needed, so most commands are `docker compose ...` wrapping the tool you'd
normally run directly.

Service names referenced below (from [`docker-compose.yml`](../docker-compose.yml)): `db`,
`dev`/`prod` (frontend), `backend-dev`/`backend-prod` (backend).

---

## Creating a Django admin (superuser)

The two ways to create a login for `/admin/`:

```bash
# Interactive — prompts for username, email, password
docker compose exec backend-dev python manage.py createsuperuser
```

```bash
# Non-interactive — useful for scripting/one-liners, no prompts
docker compose exec backend-dev python manage.py shell -c "
from django.contrib.auth import get_user_model
get_user_model().objects.create_superuser('admin', 'admin@example.com', 'change-me')
"
```

Requires `backend-dev` (and `db`) to already be running (`docker compose up db backend-dev -d`).
Log in at `http://localhost:8000/admin/` (or `:8001` for `backend-prod`).

---

## Django management commands

Run as `docker compose exec backend-dev python manage.py <command>` (container must be running) or
`docker compose run --rm backend-dev python manage.py <command>` (spins up a one-off container just
for this command, no need for anything to already be running).

| Command | What it does |
|---|---|
| `makemigrations` | Scans models for changes and writes new migration files. |
| `migrate` | Applies pending migrations to the database. |
| `createsuperuser` | Creates an admin login (see above). |
| `seed_content` | This project's own command — (re)populates the content models with the site's default content. Idempotent, safe to re-run. |
| `shell` | Opens a Python shell with Django loaded (models, settings, etc. all importable). |
| `dbshell` | Opens a `psql` shell straight into the configured Postgres database. |
| `collectstatic` | Gathers static files (admin CSS/JS, etc.) into `STATIC_ROOT` for production serving. |
| `showmigrations` | Lists all migrations and whether each has been applied. |
| `test` / `pytest` | Runs the test suite (this project uses `pytest` — see `pytest.ini`). |

---

## Docker Compose commands

Compose commands manage *groups* of containers defined in `docker-compose.yml` as one unit, so you
don't have to remember individual container names/networks/volumes yourself.

| Command | What it does |
|---|---|
| `docker compose up <service> -d` | Starts a service in the background ("detached"). Builds its image first if it uses `build:` and doesn't have one yet. |
| `docker compose up <service> --build` | Same, but forces a rebuild of the image first — needed after editing a `Dockerfile` or a file it `COPY`s in a way Compose won't auto-detect. |
| `docker compose down` | Stops and removes all containers + the network Compose created. Named volumes (like `pgdata`) are kept. |
| `docker compose down -v` | Same, but **also deletes named volumes** — this wipes the Postgres data. Use deliberately. |
| `docker compose ps` | Lists this project's containers and their status. |
| `docker compose logs <service>` | Shows a service's output. Add `-f` to follow live, `--tail=50` to limit history. |
| `docker compose exec <service> <cmd>` | Runs a command inside an **already-running** container (e.g. `docker compose exec backend-dev bash`). |
| `docker compose run --rm <service> <cmd>` | Spins up a **new, temporary** container from a service's image to run one command, then removes it. Useful when the service isn't already running, or you want a one-off command that doesn't collide with the main process (e.g. running tests while `runserver` is up on the same service). |
| `docker compose build <service>` | Builds (or rebuilds) a service's image without starting it. |
| `docker compose stop` / `start` | Stops/starts containers without removing them (keeps them around for a quick restart). |
| `docker compose restart <service>` | Stops and starts a single service. |
| `docker compose config` | Prints the fully resolved compose configuration — good for catching YAML mistakes. |

**Examples used in this project:**

```bash
docker compose up dev backend-dev db -d       # full dev stack, hot-reload
docker compose up prod backend-prod db -d --build   # full prod stack, rebuilding images
docker compose logs backend-dev -f            # tail Django's logs
docker compose exec backend-dev python manage.py migrate
docker compose run --rm backend-dev pytest    # run the test suite
docker compose down                           # stop everything (keeps the database)
```

---

## Docker commands (plain, not Compose)

These operate on individual containers/images directly, without needing a `docker-compose.yml`.
Useful for inspecting things Compose is managing, or cleaning up.

| Command | What it does |
|---|---|
| `docker ps` | Lists running containers. |
| `docker ps -a` | Lists **all** containers, including stopped ones. |
| `docker images` | Lists downloaded/built images. |
| `docker exec -it <container> <cmd>` | Runs a command inside a running container interactively (`-it` = interactive + allocate a terminal), e.g. `docker exec -it himanshu-photography-docker-backend-dev-1 bash`. |
| `docker logs <container>` | Shows a container's output (same idea as `compose logs`, but by container name/ID). |
| `docker stop <container>` | Stops a running container. |
| `docker start <container>` | Starts a stopped container back up. |
| `docker rm <container>` | Deletes a stopped container. |
| `docker rmi <image>` | Deletes an image. |
| `docker volume ls` | Lists all Docker-managed volumes on the machine (across all projects). |
| `docker network ls` | Lists Docker networks. |
| `docker build -t <name> <path>` | Builds an image from a Dockerfile directly (what `docker compose build` does under the hood, one service at a time). |
| `docker system prune` | Removes unused containers/networks/images to free disk space. Add `--volumes` to also prune unused volumes (careful — irreversible). |

---

## Typical day-to-day flow

```bash
# Start everything for local dev
docker compose up dev backend-dev db -d

# ...edit code, changes hot-reload automatically...

# Made a model change? Generate + apply migrations
docker compose exec backend-dev python manage.py makemigrations
docker compose exec backend-dev python manage.py migrate

# Run the test suite
docker compose run --rm backend-dev pytest

# Check logs if something looks wrong
docker compose logs backend-dev -f

# Done for the day
docker compose down
```
