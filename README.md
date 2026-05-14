# Himanshu Photography

A premium, modern portfolio web application for Himanshu Photography. Built to showcase stunning photography work, detail the services offered, and provide clients with an elegant way to book sessions.

## Features

- **Beautiful Portfolio Gallery:** A masonry-style layout to display the finest wedding, engagement, and portrait photography.
- **Detailed Services:** A comprehensive overview of photography packages, from pre-wedding to maternity shoots.
- **Interactive Contact Form:** A sleek contact section for clients to book sessions, complete with location mapping.
- **Smooth Animations:** Powered by Framer Motion, providing a fluid, luxury user experience.
- **Responsive Design:** Fully optimized for mobile, tablet, and desktop viewing.

## Tech Stack

- **Framework:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling:** Tailwind CSS (with custom themes and gradients)
- **Routing:** React Router DOM
- **Animations:** Framer Motion
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (for local development)
- [Docker](https://www.docker.com/) (optional, for production containerization)

### Installation

1. Clone the repository or extract the project files.
2. Navigate to the project directory:
   ```bash
   cd himanshu-photography
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

Start the Vite development server to view the app locally:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🐳 Docker Support (Production)

This project is fully containerized using a multi-stage Docker build for optimal performance and security.

### Build and Run with Docker

1. **Build the image:**
   ```bash
   docker build -t himanshu-photography .
   ```

2. **Run the container:**
   ```bash
   docker run -p 8080:80 himanshu-photography
   ```

3. **Access the site:**
   Navigate to `http://localhost:8080`.

### Docker Architecture

- **Multi-Stage Build:** We use a `node:20-alpine` stage to build the project and a `nginx:stable-alpine` stage to serve the final static files. This keeps the image size under 25MB.
- **SPA Routing:** A custom `nginx.conf` is included to handle client-side routing (React Router), ensuring that page refreshes on sub-routes (like `/portfolio`) work correctly.
- **Optimization:** A `.dockerignore` file is used to speed up builds by excluding unnecessary files like `node_modules` and `.git`.

