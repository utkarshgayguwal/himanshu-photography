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

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

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

Open `http://localhost:5173` (or the URL provided in your terminal) in your browser to see the application.

### Building for Production

To create a production-ready build:

```bash
npm run build
```

This will generate a `dist` directory containing the optimized static files, ready to be deployed to platforms like Vercel, Netlify, or your preferred hosting provider.

## Project Structure

```text
himanshu-photography/
├── public/               # Static assets (local images, icons)
├── src/
│   ├── components/       # Reusable UI components (Navbar, Footer, etc.)
│   ├── pages/            # Main application pages (Home, About, Services, Work, Contact)
│   ├── App.jsx           # Main application routing and layout setup
│   ├── index.css         # Global CSS styles and Tailwind directives
│   └── main.jsx          # Application entry point
├── package.json          # Project metadata and dependencies
├── tailwind.config.js    # Tailwind CSS configuration
└── vite.config.js        # Vite bundler configuration
```

## Customization

- **Brand Colors:** The project heavily uses a luxury color palette. You can find and modify the gold gradient (`#C9A96E`, `#E8D5AA`) and dark background (`#0D0D0D`, `#080808`) classes throughout the components and pages.
- **Typography:** The app uses `Cormorant Garamond` for elegant headings and `DM Sans` for clean body text. Ensure these are imported in your global styles or `index.html`.

## Contact

For any queries regarding this project, please reach out via the contact form on the live site.
