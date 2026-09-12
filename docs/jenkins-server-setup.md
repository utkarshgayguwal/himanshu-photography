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

## 3. Run Jenkins as a Docker container (not a native apt package)

Jenkins's Debian/Ubuntu apt repo requires trusting a signing key that Jenkins periodically rotates
— see "Why not the apt package" below for what went wrong the first time this was tried. Since this
box already runs everything else in Docker, it's simpler and more durable to run Jenkins the same
way. The one thing the stock `jenkins/jenkins:lts` image is missing is the `docker` CLI itself
(needed so pipeline steps can run `docker pull`/`docker compose up`), so build a small image on top
of it that adds that:

```bash
mkdir -p ~/jenkins-docker && cd ~/jenkins-docker
cat > Dockerfile <<'EOF'
FROM jenkins/jenkins:lts
USER root
RUN apt-get update && apt-get install -y ca-certificates curl gnupg \
  && install -m 0755 -d /etc/apt/keyrings \
  && curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg \
  && chmod a+r /etc/apt/keyrings/docker.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(. /etc/os-release && echo $VERSION_CODENAME) stable" > /etc/apt/sources.list.d/docker.list \
  && apt-get update \
  && apt-get install -y docker-ce-cli docker-compose-plugin \
  && rm -rf /var/lib/apt/lists/*
USER jenkins
EOF

docker build -t jenkins-with-docker .
```

(This uses Docker's **Debian** repo, not Ubuntu's — `jenkins/jenkins:lts` is Debian-based
internally regardless of the Ubuntu host underneath it. Docker's own signing key here is fetched
fresh at build time, not baked into this doc, so it can't go stale the same way.)

## 4. Run it, with access to the host's Docker daemon

```bash
sudo mkdir -p /var/jenkins_home
sudo docker run -d \
  --name jenkins \
  --restart unless-stopped \
  -p 8080:8080 -p 50000:50000 \
  -v /var/jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -u root \
  jenkins-with-docker
```

- `-v /var/run/docker.sock:/var/run/docker.sock` — lets Jenkins (itself running in a container)
  issue `docker` commands that execute against the **host's** Docker daemon ("Docker outside of
  Docker"). This is what a native install would otherwise get via `usermod -aG docker jenkins`.
- `-u root` — needed for Jenkins to have permission to use that socket; an acceptable tradeoff for
  a single-instance setup like this.
- `-v /var/jenkins_home:/var/jenkins_home` — persists Jenkins's config/jobs/build-history outside
  the container, so `docker restart jenkins` (or even recreating the container) doesn't lose them.

```bash
sudo docker exec jenkins docker ps   # sanity check — lists the host's containers, not an error
```

## 5. Finish setup in the browser

```bash
sudo docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
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

## Why not the apt package

An earlier version of this doc installed Jenkins natively via `apt` using
`https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key`. That failed with:

```
W: OpenPGP signature verification failed: ... NO_PUBKEY 7198F4B714ABFC68
E: The repository '...' is not signed.
```

which cascades into `apt-get install -y jenkins` failing with `Package 'jenkins' has no
installation candidate` — a downstream symptom, not a separate bug: apt never trusted the repo, so
it silently ignored its package index. Digging in with `gpg --list-keys` on the downloaded key
showed why: that "2023" key had **expired** (`[expired: 2026-03-26]`), and Jenkins had since
rotated to a newer one this doc didn't know the URL for. Re-dearmoring the same expired key changes
nothing — the key itself is the problem, not the file format.

Rather than chase Jenkins's key rotations indefinitely, running Jenkins as a Docker container (as
above) sidesteps this whole failure class — Docker's own signing key is fetched fresh inside the
image build every time, and there's no separate systemd/apt package to go stale on the host.

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
