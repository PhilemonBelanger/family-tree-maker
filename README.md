# 🌳 Family Tree Maker

A browser-based family tree builder inspired by the [UsefulCharts](https://www.youtube.com/@UsefulCharts) visual style.
Add people, connect them as parents / children / siblings / spouses, drag the boxes wherever you
want, and recolor both the boxes and the links between them.

Everything runs **entirely in your browser** — there is no backend. Your tree is auto-saved to your
browser's `localStorage`, and you can export/import it as a JSON file to back it up or move it
between machines.

## Features

- **People** with a name, optional photo, birth date, and optional death date.
- **Relationships**: add a child, sibling, or spouse with one click — or draw links manually by
  dragging between the dots on the edge of each box.
- **Drag & drop** any box to lay out the tree however you like.
- **Colors**: pick a box (fill) color per person and a link color per connection.
- **Auto-save** to `localStorage`, plus **Export / Import JSON**.

## Run with Docker (recommended)

You need [Docker](https://docs.docker.com/get-docker/) with Docker Compose.

```bash
docker compose up --build
```

Then open **http://localhost:8080** in your browser.

To stop it:

```bash
docker compose down
```

This builds the React app and serves the static production bundle via nginx on port `8080`.
To use a different port, edit the `ports` line in [`docker-compose.yml`](docker-compose.yml)
(e.g. `"3000:80"`).

## Run locally without Docker (for development)

You need [Node.js](https://nodejs.org/) 18+.

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default **http://localhost:5173**). The dev server has hot reload.

To build the production bundle locally:

```bash
npm run build
npm run preview
```

## How to use

1. A starter "Root Person" box appears. Click it to open the editor on the right.
2. Fill in the name, dates, and (optionally) upload a photo.
3. Use **+ Child**, **+ Sibling**, **+ Spouse** to grow the tree. New boxes are created and
   linked automatically.
4. **Drag** boxes around the canvas to arrange the layout.
5. Click a **box** to edit a person; click a **link** to recolor just that link.
6. To connect two existing people manually, drag from a dot on one box's edge to a dot on another
   (use **bottom → top** for a parent/child link, **right → left** for a spouse link).
7. Use the top toolbar to **Add Person**, **Export/Import JSON**, or **Clear** the whole tree.

## Project structure

```
.
├── docker-compose.yml      # `docker compose up --build` entry point
├── Dockerfile              # multi-stage: build with Node, serve with nginx
├── nginx.conf              # SPA routing + asset caching
├── index.html
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx             # React Flow canvas wiring
    ├── index.css
    ├── store/useStore.js   # Zustand state + localStorage persistence
    └── components/
        ├── PersonNode.jsx  # the styled person box
        ├── Sidebar.jsx     # person / link editor panel
        └── Toolbar.jsx     # add / export / import / clear
```

## Tech

- [React](https://react.dev/) + [Vite](https://vite.dev/)
- [React Flow (@xyflow/react)](https://reactflow.dev/) for the draggable node/edge canvas
- [Zustand](https://github.com/pmndrs/zustand) for state
- nginx (in Docker) to serve the production build
