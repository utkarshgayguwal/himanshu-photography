# Setting Up Jenkins on the Server

Runbook for installing and configuring Jenkins on a fresh EC2 instance for this project's CD
pipeline (see [`cicd-pipeline.md`](./cicd-pipeline.md) for the overall design). Assumes:

- Ubuntu, provisioned per the sizing/network/storage discussion (`m7i-flex.large`, 30GB `gp3`,
  security group allowing 22/80/443 and 8080 restricted to your own IP, an Elastic IP attached).
- You're SSH'd into the instance already. Every command below runs *on the server*, not locally.

## 1. Initial update + swap file

```bash
ssh -i your-key.pem ubuntu@<your-elastic-ip>
sudo apt update && sudo apt upgrade -y

# swap file — cheap insurance against OOM during a Jenkins build
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 2. Install Docker

```bash
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker ubuntu
newgrp docker   # or just log out and back in

docker --version && docker compose version
```

## 3. Install Jenkins (needs Java first)

```bash
sudo apt install -y fontconfig openjdk-17-jre
java -version   # confirm 17 — Jenkins LTS requires 17 or 21

# Explicitly dearmor into binary keyring format — saving the raw downloaded key directly
# (e.g. via `wget -O ...`) can leave apt unable to verify it (NO_PUBKEY error on update).
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo gpg --dearmor -o /usr/share/keyrings/jenkins-keyring.gpg

echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.gpg]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt-get update
# Should show "Hit:" for the Jenkins line, no NO_PUBKEY warning. If it still fails, see
# "Troubleshooting" below.
sudo apt-get install -y jenkins
sudo systemctl enable --now jenkins
sudo systemctl status jenkins   # should show "active (running)"
```

## 4. Let Jenkins actually run `docker` commands

Easy to forget, and exactly what the `Jenkinsfile` needs for `docker login` / `docker pull` /
`docker compose up`:

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

# sanity check — should list containers (or an empty list), not "permission denied"
sudo -u jenkins docker ps
```

## 5. Finish setup in the browser

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

Visit `http://<your-elastic-ip>:8080` (works because the security group allows port 8080 from your
own IP) → paste that password → **Install suggested plugins** → create your admin user.

## 6. Install the extra plugins this pipeline needs

*Manage Jenkins → Plugins → Available plugins*:

- **GitHub Integration** — receives the webhook, triggers the job
- **Docker Pipeline** — gives the `Jenkinsfile` its `docker.withRegistry` / `docker.image(...)` steps
- **Pipeline: Stage View** — optional, a visual pipeline progress view

## 7. Add GHCR pull credentials

*Manage Jenkins → Credentials → System → Global credentials → Add Credentials*

- Kind: **Username with password**
- Username: your GitHub username
- Password: a GitHub **Personal Access Token** with `read:packages` scope (github.com → Settings →
  Developer settings → Personal access tokens)
- ID: `ghcr-creds` — must match the `credentialsId` referenced in the `Jenkinsfile`

## Troubleshooting: `NO_PUBKEY` / "not signed" on `apt-get update`

```
W: OpenPGP signature verification failed: ... NO_PUBKEY 7198F4B714ABFC68
E: The repository '...' is not signed.
```

This means apt never actually trusted the Jenkins repo, so it silently ignored its package index —
which is why a *later* `apt-get install -y jenkins` fails with `Package 'jenkins' has no
installation candidate` and `systemctl enable` fails with `Unit jenkins.service does not exist`.
Both of those are downstream symptoms, not separate bugs; fixing the key fixes both.

```bash
sudo rm -f /usr/share/keyrings/jenkins-keyring.asc
sudo rm -f /etc/apt/sources.list.d/jenkins.list

curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo gpg --dearmor -o /usr/share/keyrings/jenkins-keyring.gpg
gpg --no-default-keyring --keyring /usr/share/keyrings/jenkins-keyring.gpg --list-keys   # sanity check — prints a fingerprint, not an error

echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.gpg]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt-get update
```

## What this doesn't cover yet

This gets Jenkins running and able to talk to Docker and GHCR. Two things still need to exist in
**this repo** (not on the server) before CD is actually complete:

1. **A `Jenkinsfile`** — the real pipeline (login → pull → deploy → manual approval gate for
   production). A sketch exists in `cicd-pipeline.md`, but it isn't a working file in the project
   yet.
2. **A deploy-shaped compose file** — the current `docker-compose.yml` uses `build:`, correct for
   local dev/prod but wrong for a deploy server, which should only ever `docker pull` an
   already-built, already-tested image and never rebuild from source. Needs a variant using
   `image: ghcr.io/.../backend:${TAG}` instead.
