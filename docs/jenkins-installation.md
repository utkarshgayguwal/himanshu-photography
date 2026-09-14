# Installing Jenkins Natively (systemd, not Docker)

A from-scratch Jenkins install directly on Ubuntu — no Docker involved — for when you want to
manage it as a normal systemd service (`sudo systemctl status jenkins`, etc.) instead of the
Docker-container approach in [`jenkins-server-setup.md`](./jenkins-server-setup.md).

Assumes a fresh Ubuntu 26 instance with nothing installed yet.

These commands were verified live against Jenkins's own current install docs
(jenkins.io/doc/book/installing/linux/) rather than reused from memory — Jenkins rotates their apt
signing key periodically (see `jenkins-server-setup.md`'s "Why not the apt package" section for
what went wrong the last time a stale, memorized key URL was used), so it's worth re-checking their
docs directly if these commands ever fail with a `NO_PUBKEY` error again in the future.

## 1. Update the system

```bash
sudo apt update && sudo apt upgrade -y
```

## 2. Install Java

Current Jenkins LTS requires **Java 21 or later** (earlier LTS releases needed only 17 — worth
re-checking if this doc is used far in the future and Jenkins install fails on startup).

```bash
sudo apt install -y fontconfig openjdk-21-jre
java -version
```

## 3. Add the Jenkins apt repository

```bash
sudo mkdir -p /etc/apt/keyrings
sudo wget -O /etc/apt/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2026.key

echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
```

## 4. Install Jenkins

```bash
sudo apt update
```

Check this output before continuing: the Jenkins line should show `Hit:`, not `Ign:`, and there
should be no `NO_PUBKEY` warning. If there is one, the signing key has likely rotated again —
re-check `https://www.jenkins.io/doc/book/installing/linux/#debianubuntu` for the current key URL
rather than reusing the one above.

```bash
sudo apt install -y jenkins
```

## 5. Start it and check status

```bash
sudo systemctl enable --now jenkins
sudo systemctl status jenkins
```

Should show `active (running)`.

## 6. Open port 8080 in the instance's security group

Easy to forget — `systemctl status jenkins` showing `active (running)` only means Jenkins is
listening *on the server*, not that anything outside it can reach that port. Without this step,
visiting `http://<public-ip>:8080` in a browser just hangs/reloads endlessly instead of failing
fast, since AWS silently drops packets to a port with no inbound rule.

EC2 Console → select the instance → **Security** tab → click the security group name → **Inbound
rules** → **Add rule**:

- Type: **Custom TCP**
- Port range: **8080**
- Source: `0.0.0.0/0` (or restrict to your own IP — but if you do, remember "My IP" is a one-time
  snapshot that doesn't auto-update; see `jenkins-server-setup.md`'s troubleshooting section if
  8080 stops being reachable again later after your IP changes)

Verify before opening the browser:

```bash
# On the server — confirms Jenkins is actually listening
sudo ss -tlnp | grep 8080
```
```bash
# On your own machine — should connect instantly once the rule is added, not hang
nc -zv <your-public-ip> 8080
```

## 7. Get the initial admin password and finish setup in the browser

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

Visit `http://<your-public-ip>:8080` → paste the password → **Install suggested plugins** → create
your admin user.

From here, the remaining setup (plugins, GHCR credentials) is identical to
[`jenkins-server-setup.md`](./jenkins-server-setup.md)'s steps 6–7 — those aren't specific to
whether Jenkins runs natively or in a container.

## One thing native install still needs, that the Docker approach got for free

If Jenkins is going to run `docker` commands in pipeline steps (`docker pull`, `docker compose
up`), it needs Docker installed on this host and the `jenkins` user added to the `docker` group:

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
sudo -u jenkins docker ps   # sanity check — should list containers, not "permission denied"
```

## Next: the actual deploy pipeline

Once Jenkins is running and can talk to Docker, [`cd-deployment.md`](./cd-deployment.md) covers
what's actually configured on top of this — the Jenkins job itself, the `Jenkinsfile`, and how a
`git push` ends up as a running deployment.

(This assumes Docker itself is already installed — see `jenkins-server-setup.md`'s step 2 for
those commands, unchanged regardless of how Jenkins itself is installed.)
