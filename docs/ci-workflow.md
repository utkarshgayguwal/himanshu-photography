# `.github/workflows/ci.yml`

This explains the actual CI workflow file in this repo, line by line. See
[`cicd-pipeline.md`](./cicd-pipeline.md) for the broader design rationale (why CI and CD are split
across GitHub Actions and Jenkins) — this doc is specifically about what this one file does and why
it's written the way it is.

## Triggers and permissions

```yaml
on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read
  packages: write
```

Runs on every PR (any branch) *and* on every push to `main`. This distinction matters: PRs get full
verification — lint, test, Docker build — but should never push anything to the registry (you don't
want an unreviewed branch's image sitting in GHCR). Only a push to `main` (i.e. a merge) does that.
The `docker` job below checks `github.event_name` to tell these two cases apart.

`packages: write` is required for the final job to push images to GHCR using the automatically
provided `GITHUB_TOKEN` — without it, the push step fails with a 403 regardless of how login is
configured.

```yaml
env:
  REGISTRY: ghcr.io
```

A workflow-level variable, referenced later as `${{ env.REGISTRY }}` instead of repeating the
literal string.

## Job 1 — `backend`: lint + test

```yaml
services:
  postgres:
    image: postgres:16-alpine
    env:
      POSTGRES_DB: himanshu_test
      POSTGRES_USER: himanshu
      POSTGRES_PASSWORD: himanshu
    ports:
      - 5432:5432
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

GitHub Actions can run sidecar containers (`services:`) alongside a job — this spins up a throwaway
Postgres for the duration of the job only, exposed on `localhost:5432` to the runner (this project's
`backend/config/settings.py` needs a real Postgres; there's no sqlite fallback). The `options`
health-check block makes Actions wait until Postgres actually accepts connections before running
any step — without it, `pytest` could start before the database is ready to accept connections.

```yaml
defaults:
  run:
    working-directory: backend
```

Every `run:` step in this job executes from `backend/` automatically — steps just say
`ruff check .` instead of `ruff check backend/` repeated everywhere.

```yaml
- uses: actions/setup-python@v5
  with:
    python-version: '3.12'
    cache: 'pip'
    cache-dependency-path: backend/requirements.txt
```

Pins the interpreter version explicitly (don't rely on the runner's default, which changes over
time) and caches pip downloads keyed to a hash of `requirements.txt` — unchanged dependencies mean
near-instant installs on subsequent runs.

```yaml
- name: Lint (ruff)
  run: ruff check .
```

Uses the `[tool.ruff]` config in `backend/pyproject.toml` (scoped to `E`/`F`/`I` rules, migrations
excluded, `seed_content.py` exempted from line-length — see that file's comments for why ruff's raw
defaults are too noisy for idiomatic Django/DRF code).

```yaml
- name: Test (pytest)
  env:
    DJANGO_SECRET_KEY: ci-test-secret-key
    DJANGO_DEBUG: 'True'
    DJANGO_ALLOWED_HOSTS: '*'
    POSTGRES_DB: himanshu_test
    POSTGRES_USER: himanshu
    POSTGRES_PASSWORD: himanshu
    POSTGRES_HOST: localhost
    POSTGRES_PORT: 5432
  run: pytest
```

These env vars are exactly what `backend/config/settings.py` reads via `os.environ.get(...)` — same
mechanism as `backend/.env` for local runs, just supplied by the workflow instead of a file. No
separate `manage.py migrate` step is needed here: `pytest-django` creates and migrates its own test
database automatically as part of test setup.

## Job 2 — `frontend`: lint + build

```yaml
- run: npm ci
- run: npm run lint
- run: npm run build
```

`npm ci` (not `npm install`) — deterministic, installs exactly what's pinned in
`package-lock.json`, and fails instead of silently rewriting the lockfile if it's out of sync,
which is what you want in CI. `lint` and `build` are the scripts already defined in
`frontend/package.json` (eslint, then `vite build`). The build step doubles as "does the app
actually compile," independent of whether the Docker image builds correctly.

## Job 3 — `docker`: build (and push, only after merge)

```yaml
needs: [backend, frontend]
```

Won't start until both prior jobs succeed — no point building images from code that fails lint or
tests.

```yaml
strategy:
  matrix:
    include:
      - name: backend
        context: ./backend
      - name: frontend
        context: ./frontend
```

Runs the same steps twice with different inputs instead of duplicating the whole job for each
image.

```yaml
- name: Log in to GHCR
  if: github.event_name == 'push'
  uses: docker/login-action@v3
  ...

- uses: docker/build-push-action@v6
  with:
    context: ${{ matrix.context }}
    push: ${{ github.event_name == 'push' }}
    tags: |
      ${{ env.REGISTRY }}/${{ github.repository }}-${{ matrix.name }}:${{ github.sha }}
      ${{ env.REGISTRY }}/${{ github.repository }}-${{ matrix.name }}:latest
```

This is the PR-vs-merge split in practice: on a PR, this job builds each image (proving the
Dockerfile is valid — catches a broken `Dockerfile` before merge) but never logs into or pushes to
GHCR. Only a push to `main` does both.

**Tagging by `${{ github.sha }}`** (the full commit SHA) is the single most important line here —
it's what makes rollback possible later on the Jenkins/deploy side: "redeploy the previous version"
becomes "pull a different tag that's already sitting in the registry," not a rebuild from an old
commit. `latest` is pushed too, purely for convenience when browsing the registry by hand — nothing
in the deploy pipeline should ever depend on it.

```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

Reuses Docker layer cache between workflow runs via GitHub's own cache storage — unchanged layers
(like the `npm install`/`pip install` layer, when the lockfile hasn't moved) don't get rebuilt every
single run.

## What this workflow deliberately does *not* do

- It doesn't deploy anywhere — see [`cicd-pipeline.md`](./cicd-pipeline.md) for why that's Jenkins's
  job, triggered by a webhook once this workflow finishes.
- It doesn't run `pylint` — see `cicd-pipeline.md`'s comparison table for why `ruff` alone is the
  recommended CI gate, with pylint (if used at all) better suited as a non-blocking, separately-run
  report.
- It builds both images on *every* PR, even if only one side changed. A future optimization would
  use `dorny/paths-filter` (or similar) to skip the frontend build on backend-only PRs and vice
  versa — not done here to keep the workflow simple to read first.
