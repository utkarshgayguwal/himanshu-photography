# CI/CD Pipeline: GitHub Actions (CI) + Jenkins (CD)

This documents a pipeline design for this project: **GitHub Actions owns CI** (verify + package the
code), **Jenkins owns CD** (actually ship it to a server). This file explains *why* it's split this
way, walks through every stage, and gives copy-adaptable examples. It does not (yet) add the actual
`.github/workflows/` files or a `Jenkinsfile` to this repo — this is the reference doc to build
those from when you're ready.

## Why split CI and Jenkins like this at all

GitHub Actions runners are ephemeral machines GitHub owns, not yours. They're great for anything
that only needs your *source code* — installing deps, linting, testing, building an image, pushing
it somewhere. They're a bad place to hold credentials that can touch your actual server (SSH keys,
production database passwords) — every workflow run is a fresh environment with your secrets
injected into it, so anything with that scope is more attack surface than necessary.

Jenkins, by contrast, runs on infrastructure *you* control (your own server, or one in the same
network as what it's deploying to). It's the right place to hold "can deploy to production"
credentials, because it's not a third party's shared runner pool.

So: GitHub Actions produces a *trusted, tested, already-built artifact* (a Docker image tagged with
a commit SHA) and hands it off. Jenkins's only job is "take that artifact and run it somewhere" —
it never touches your source code or rebuilds anything.

## The full flow

```
Push / PR to GitHub
        │
        ▼
┌───────────────────── GitHub Actions (CI) ─────────────────────┐
│  Checkout → Install deps → Lint → Test (pytest) → Docker build │
└───────────────────────────────┬────────────────────────────────┘
                                 │ (only on push to main, after CI passes)
                                 ▼
                     Push image to GHCR
                     ghcr.io/you/repo-backend:<sha>
                     ghcr.io/you/repo-frontend:<sha>
                                 │
                                 ▼
                    GitHub → Jenkins webhook
                        (fires on push)
                                 │
                                 ▼
┌────────────────────────── Jenkins (CD) ───────────────────────┐
│  docker login ghcr.io → docker pull <sha> → deploy → migrate    │
└───────────────────────────────┬────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
                Staging                  Production
           (auto-deployed)          (manual approval gate)
```

---

## Part 1 — CI on GitHub Actions

A workflow file lives at `.github/workflows/ci.yml` and is triggered by an `on:` block — typically
`pull_request` (run checks before merge) and `push` to `main` (run again after merge, then proceed
to the build/push stage that PRs shouldn't trigger).

### 1. Checkout

```yaml
- uses: actions/checkout@v4
```
Every job starts on a fresh runner with nothing on it — this step clones your repo onto it.

### 2. Install dependencies

```yaml
- uses: actions/setup-python@v5
  with:
    python-version: '3.12'
    cache: 'pip'
- run: pip install -r backend/requirements.txt
```
`cache: 'pip'` caches downloaded packages between runs keyed by your `requirements.txt` hash, so
CI doesn't re-download the whole dependency tree every single run. For the frontend, the equivalent
is `actions/setup-node@v4` with `cache: 'npm'`, then `npm ci` (not `npm install` — `ci` is
deterministic, installs exactly what's in `package-lock.json`, and fails instead of silently
updating it, which is what you want in CI).

### 3. Lint — ruff vs. pylint (you don't usually need both)

| | **ruff** | **pylint** |
|---|---|---|
| Speed | Very fast (written in Rust) — near-instant even on large codebases | Much slower — does deeper analysis |
| Coverage | Style, import sorting, unused vars, many common bug patterns (it reimplements most of flake8 + isort + several plugins in one tool) | Everything ruff does, plus deeper semantic/design checks (too-many-arguments, cyclomatic complexity, some real logic issues) |
| Config | `pyproject.toml`, sensible defaults | `.pylintrc`, very configurable but noisy out of the box — needs tuning or it flags a lot of stylistic opinions you may not care about |
| Auto-fix | Yes, `ruff check --fix` fixes most findings automatically | No |

**Practical recommendation**: use **ruff** as the primary CI gate — it's fast enough to run on
every push without slowing the pipeline down, and catches the large majority of real issues.
Treat pylint as optional, deeper analysis — some teams run it as a non-blocking step (reports
findings but doesn't fail the build) rather than a hard gate, specifically because tuning it to not
be noisy takes real effort. You don't need a separate "syntax check" step — both tools parse the
full AST, so a syntax error fails immediately regardless.

```yaml
- run: pip install ruff
- run: ruff check backend/
```

For the frontend, this project already has `frontend/eslint.config.js` — the CI equivalent is just
`- run: npm run lint` (already defined as a script in `frontend/package.json`).

### 4. Test

```yaml
- run: pip install pytest pytest-django
- run: pytest
  working-directory: backend
  env:
    POSTGRES_HOST: localhost
    # ...same env vars backend/config/settings.py expects
```
pytest-django needs a real Postgres to run against (this project's `DATABASES` config isn't
sqlite) — in GitHub Actions that means adding a `services:` block to the job that spins up a
throwaway `postgres:16-alpine` container for the duration of the job, the same way `docker-compose.yml`'s
`db` service works locally.

### 5. Docker build

```yaml
- uses: docker/build-push-action@v6
  with:
    context: ./backend
    push: false   # build-only on PRs — don't push untrusted branch code
    tags: backend:ci
```
On a PR, you typically build *without* pushing — just prove the Dockerfile is valid and the image
compiles. The build-and-*push* step (next section) only runs after merge to `main`.

---

## Part 2 — Container Registry (GHCR)

GHCR (`ghcr.io`) is GitHub's own container registry — the natural choice here since it needs zero
extra account setup and integrates with GitHub's built-in `GITHUB_TOKEN`:

```yaml
permissions:
  packages: write

- uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}   # auto-provided, no setup needed

- uses: docker/build-push-action@v6
  with:
    context: ./backend
    push: true
    tags: |
      ghcr.io/your-org/himanshu-photography-backend:${{ github.sha }}
      ghcr.io/your-org/himanshu-photography-backend:latest
```

**Tag with the commit SHA (`${{ github.sha }}`), not just `latest`.** This is the single habit that
makes rollback possible later — every image that's ever been deployed stays pullable by its exact
tag, so "redeploy the previous version" is just "pull a different tag," not a rebuild. `latest` is
fine to *also* push (handy for humans browsing the registry), but never rely on it for deploys.

By default, a package pushed to GHCR by a repo is **private** and only pullable by people/tokens
with access to that repo — you'll need a Personal Access Token with `read:packages` scope for
Jenkins to pull it (see Secrets, below), or make the package public if that's acceptable for this
project.

---

## Part 3 — GitHub → Jenkins webhook

A webhook is just GitHub making an HTTP POST to a URL you configure, whenever something happens
(here: a push to `main`, or — more precisely — the CI workflow finishing successfully).

**Setting it up:**
1. In the GitHub repo: **Settings → Webhooks → Add webhook**.
2. **Payload URL**: `https://your-jenkins-host/github-webhook/` (Jenkins's GitHub plugin listens
   here by default).
3. **Content type**: `application/json`.
4. **Secret**: a random string, entered on both the GitHub side and in Jenkins's job config —
   Jenkins uses this to verify the payload actually came from GitHub and wasn't forged. Never skip
   this.
5. **Which events**: typically "just the push event," or better — trigger on `workflow_run`
   completion specifically, so Jenkins only fires *after* CI has actually finished and pushed an
   image (not on every push, some of which might fail CI).

**The catch**: this requires Jenkins to be reachable from the internet (GitHub needs to be able to
reach it), which means either a public IP/domain with HTTPS, or a tunneling service. If your
Jenkins server sits behind a firewall with no public ingress, the common alternative is **polling**
instead of a webhook — Jenkins's "Poll SCM" checks the repo on a schedule (e.g. every 2 minutes)
instead of waiting to be told. Slightly slower to react, but needs no inbound networking at all.

---

## Part 4 — CD on Jenkins

Jenkins pipelines are defined in a `Jenkinsfile` (checked into the repo, or configured directly in
the job). A **declarative pipeline** looks like this:

```groovy
pipeline {
    agent any
    parameters {
        string(name: 'IMAGE_TAG', defaultValue: 'latest', description: 'Image tag to deploy')
    }
    stages {
        stage('Login to GHCR') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'ghcr-creds', usernameVariable: 'U', passwordVariable: 'P')]) {
                    sh 'echo $P | docker login ghcr.io -u $U --password-stdin'
                }
            }
        }
        stage('Deploy to Staging') {
            steps {
                sh """
                    docker pull ghcr.io/your-org/himanshu-photography-backend:${IMAGE_TAG}
                    docker pull ghcr.io/your-org/himanshu-photography-frontend:${IMAGE_TAG}
                    BACKEND_TAG=${IMAGE_TAG} FRONTEND_TAG=${IMAGE_TAG} docker compose -f docker-compose.staging.yml up -d
                """
            }
        }
        stage('Approve Production') {
            steps {
                input message: 'Deploy this to production?'
            }
        }
        stage('Deploy to Production') {
            steps {
                sh """
                    BACKEND_TAG=${IMAGE_TAG} FRONTEND_TAG=${IMAGE_TAG} docker compose -f docker-compose.prod.yml up -d
                """
            }
        }
    }
}
```

Key ideas here:
- Jenkins never runs `docker build` — it only ever `docker pull`s a tag that GitHub Actions already
  built and tested. If it can't pull the image, something upstream already failed, which is exactly
  the point of the split.
- `docker-compose.yml`'s `build:` directives would need to become `image:` referencing a
  `${BACKEND_TAG}`-style variable for a deploy server, rather than always building locally — this
  project's current compose file is written for *local* dev/prod, where building on the same
  machine you run on is fine. A real deploy server pulls, it doesn't build.
- The `input` step is the manual approval gate — the pipeline literally pauses and waits for a
  human to click "proceed" in the Jenkins UI before touching production. Staging deploys
  automatically; production doesn't.

---

## Part 5 — Secrets, across both systems

Secrets show up in three *separate* places, each with its own mechanism — don't conflate them:

| Where | Mechanism | What lives there |
|---|---|---|
| GitHub Actions | Repo/org **Settings → Secrets and variables → Actions** | Nothing extra needed for GHCR push — `GITHUB_TOKEN` is auto-provided per run. Add secrets here only for things Actions itself needs (e.g. a Slack webhook for build notifications). |
| Jenkins | **Manage Jenkins → Credentials** | GHCR *pull* token (a PAT with `read:packages`, since Jenkins isn't a GitHub Actions run and gets no automatic token), SSH keys if deploying to a remote host, the webhook shared secret. |
| The running containers (staging/production) | Environment variables injected by whatever starts the containers on that server — **not** baked into the image | `DJANGO_SECRET_KEY`, real `POSTGRES_PASSWORD`, `CORS_ALLOWED_ORIGINS`, etc. This is the same principle as this project's local `backend/.env` — except for a real server, these values would live in Jenkins credentials (injected into the `docker compose up` call as env vars) or a proper secrets manager, never in a file sitting in the repo. |

---

## Part 6 — Rollback

Because every image is tagged by commit SHA, rolling back is just: run the Jenkins pipeline again
with an older `IMAGE_TAG` parameter (the pipeline above already takes this as a parameter for
exactly this reason). No rebuild, no `git revert` — the old image is still sitting in GHCR exactly
as it was built and tested. This is the entire payoff of tagging by SHA instead of only `latest`:
without it, "roll back" means rebuilding from an old commit and hoping the build environment
hasn't drifted since.

A more automated version of this adds a health check after each deploy stage (e.g. `curl` the
`/api/services/` endpoint, expect 200) and has Jenkins auto-redeploy the previous tag if it fails —
but a manual "run pipeline with the previous SHA" is a perfectly reasonable starting point.

---

## What this project would need to actually run this

| Piece | Status in this repo |
|---|---|
| `backend/requirements.txt`, `frontend/package.json` | ✅ already define the dependencies to install |
| `pytest` suite | ✅ already exists (`backend/content/tests/`, `backend/leads/tests/`) |
| `eslint.config.js` | ✅ already exists for frontend lint |
| `ruff`/`pylint` config | ❌ not yet added — would need `ruff` in `backend/requirements.txt` (or a separate `requirements-dev.txt`) and optionally a `pyproject.toml` `[tool.ruff]` section |
| `backend/Dockerfile`, `frontend/Dockerfile` | ✅ already exist and already build successfully |
| `.github/workflows/ci.yml` | ❌ not yet added |
| GHCR push permissions | ❌ nothing pushes anywhere yet — images only exist locally |
| Jenkins server | ❌ doesn't exist yet — needs a host, the GitHub plugin installed, and credentials configured |
| Webhook | ❌ n/a until Jenkins exists |
| A deploy-shaped compose file (`image:` not `build:`) | ❌ current `docker-compose.yml` is written for local build+run, not pulling a pre-built tag |
| Staging/production servers | ❌ this only runs on your machine right now |

The lowest-effort, highest-value next step if you want to start actually building this: add
`.github/workflows/ci.yml` covering just lint + test (no Docker/registry/Jenkins yet) — that alone
gets every PR automatically verified, which is most of the day-to-day value of this whole pipeline.
