# Himanshu Photography

A premium, modern portfolio web application for Himanshu Photography. Built to showcase stunning photography work, detail the services offered, and provide clients with an elegant way to book sessions.

## Features

- **Beautiful Portfolio Gallery:** A masonry-style layout to display the finest wedding, engagement, and portrait photography.
- **Detailed Services:** A comprehensive overview of photography packages, from pre-wedding to maternity shoots.
- **Interactive Contact Form:** A sleek contact section for clients to book sessions.
- **Smooth Animations:** Powered by Framer Motion, providing a fluid, luxury user experience.
- **Responsive Design:** Fully optimized for mobile, tablet, and desktop viewing.

## Tech Stack

- **Framework:** React + Vite
- **Styling:** Tailwind CSS (with custom themes and gradients)
- **Routing:** React Router DOM
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Deployment:** Docker & Nginx

---

## 🚀 Quick Start with Docker

This project is fully containerized. You do not need to install Node.js or Vite on your local machine; you only need **Docker**.

### 🛠 Development Mode (Live Changes)
Use this mode while coding. It uses **Volume Mounting** so any changes you save in your editor will reflect instantly in the browser.

```bash
docker compose up dev
```
- **Access the site:** `http://localhost:5173`
- **Hot Reload:** Enabled (Changes reflect instantly).

### 🏗 Production Mode (Stable)
Use this mode to test the final, optimized version of the site running on a production-grade Nginx server.

```bash
docker compose up prod --build
```
- **Access the site:** `http://localhost:8080`
- **Note:**  Changes you make to your code will not show up here until you run the command again with --build

### 🛑 Stopping the Application
To stop the running containers:
- Press `Ctrl + C` in the terminal.
- Or run `docker compose down` to remove the containers.


