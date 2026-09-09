# IBM Notes — Explain Notes App

A personal notes viewer built with **React + Vite** and the **Carbon Design System**.

Transform complex notes into beautifully formatted, readable documents — organized as projects you can browse, read, and manage.

## Features

- 📁 **Projects** — each project is a set of notes paired with a formatted output document
- 📖 **Note viewer** — full markdown rendering with styled callouts, tables, and diagram blocks
- ➕ **New project form** — paste raw notes and the formatted output to save a project
- 💾 **Persistent storage** — all data saved to `localStorage`
- 🎨 **IBM Carbon Design System** — IBM Plex Sans/Mono fonts, Carbon `g10` theme, IBM Blue accents

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Tech stack

- [React 19](https://react.dev/)
- [Vite 8](https://vite.dev/)
- [Carbon Design System](https://carbondesignsystem.com/) (`@carbon/react`)
- [react-router-dom](https://reactrouter.com/)
- [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm)
