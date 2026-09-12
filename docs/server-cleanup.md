# Freeing Up Disk Space on the Server

Commands and habits for keeping the EC2 instance's disk usage under control once Docker + Jenkins
have been running there for a while. As covered in the sizing discussion, the actual space hogs on
a box like this are Docker's image/layer cache and Jenkins's build history — not this project's own
data (Postgres holds only a few MB of content, and won't grow meaningfully).

**Always look before you clean** — don't run prune commands blind.

## 1. See what's actually using space

```bash
df -h                    # overall disk usage per filesystem
docker system df         # Docker's own usage, broken down by images/containers/volumes/cache
docker system df -v      # same, but itemized — shows exactly which image/volume is big
du -sh /var/lib/docker/* 2>/dev/null | sort -rh   # what's biggest inside Docker's data dir
du -sh /var/lib/jenkins/* 2>/dev/null | sort -rh  # same, for Jenkins's home directory
```

Run `docker system df` first, every time — it tells you whether images, the build cache, or
containers are actually the problem before you reach for a prune command.

## 2. Docker cleanup

| Command | What it removes | Risk |
|---|---|---|
| `docker container prune` | Stopped containers | Safe |
| `docker image prune` | **Dangling** images only (untagged layers left behind by rebuilds) | Safe |
| `docker image prune -a` | **All** images not used by a running container — including tagged ones like `ghcr.io/.../backend:abc123` | Low — just re-`docker pull`s next deploy, costs time not data |
| `docker builder prune` | Build cache (layers cached to speed up rebuilds) | Safe — just makes the *next* build slower |
| `docker network prune` | Unused networks | Safe |
| `docker volume prune` | **Named/anonymous volumes not attached to any container** | ⚠️ Read the warning below |
| `docker system prune` | Combines container + image (dangling only) + network + build cache prune | Safe, good default |
| `docker system prune -a` | Same, but images like `-a` above (all unused, not just dangling) | Low, see above |
| `docker system prune -a --volumes` | Everything above, **plus unused volumes** | ⚠️ Read the warning below |

**Never run a volume-pruning command without checking `docker volume ls` first.** This project's
Postgres data lives in a named volume (`pgdata` in `docker-compose.yml`) — Docker won't remove a
volume that's currently attached to a container (even a stopped one), but if the `db` container
ever gets removed (not just stopped) while `pgdata` isn't referenced anywhere else, `--volumes`
*will* delete it, and there's no managed-RDS backup to fall back on here. If in doubt, run
`docker volume ls` and eyeball the list before adding `--volumes` to anything.

**Day-to-day safe habit**: `docker system prune -f` (the `-f` just skips the "are you sure?"
prompt) — dangling images and build cache only, never touches anything currently in use.

### Capping container log growth

Docker container logs (stdout/stderr from `backend`, `frontend`, `db`) grow unbounded by default.
Cap them per-service in `docker-compose.yml`:

```yaml
services:
  backend:
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

Or set it once for every container globally in `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" }
}
```
(requires `sudo systemctl restart docker` to take effect).

## 3. Jenkins cleanup

Jenkins accumulates two things that Docker's prune commands know nothing about: **build history**
and **job workspaces**, both under `/var/lib/jenkins`.

- **Discard old builds**: in each job's config (or set a global default under *Manage Jenkins →
  System*), enable *"Discard old builds"* and set either "Max # of builds to keep" (e.g. 10) or
  "Days to keep builds" (e.g. 14). Without this, every build's console log, artifacts, and metadata
  stick around forever.
- **Clean the workspace after each build**: add a `cleanWs()` step at the end of your `Jenkinsfile`
  (needs the *Workspace Cleanup* plugin), so checked-out source and any intermediate build files
  don't pile up between runs.
- **Check what's actually big**: `du -sh /var/lib/jenkins/jobs/*/builds` shows per-job build
  history size — a good way to find one noisy job dragging the whole disk down.

## 4. System-level cleanup (Ubuntu)

```bash
sudo apt-get clean            # remove downloaded .deb package cache
sudo apt-get autoremove       # remove packages installed as dependencies that nothing needs anymore
sudo journalctl --vacuum-time=7d   # trim systemd logs to the last 7 days
# or:
sudo journalctl --vacuum-size=200M # cap systemd logs to 200MB total
```

## 5. Automate the safe parts

The genuinely safe commands (dangling images, build cache, stopped containers, journal trimming)
are fine to put on a schedule instead of remembering to run them by hand:

```bash
# crontab -e
0 3 * * 0 docker system prune -f >> /var/log/docker-prune.log 2>&1
0 3 * * 0 journalctl --vacuum-time=7d
```

**Deliberately left out of any automated job**: `-a` (removes tagged images you might want for a
quick rollback) and `--volumes` (the Postgres data risk above). Those two stay manual, run only
when you've actually checked `docker system df` / `docker volume ls` first.

## Quick reference

```bash
# Diagnose
df -h
docker system df -v

# Safe, routine cleanup
docker system prune -f
sudo apt-get autoremove -y && sudo apt-get clean
sudo journalctl --vacuum-time=7d

# More aggressive (re-pulls needed, but no data loss)
docker image prune -a -f

# Dangerous — check `docker volume ls` first, every time
docker volume prune
```
