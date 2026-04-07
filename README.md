# Party Planner Trek

A static party planning web app for organizing all sorts of parties — birthdays, weddings, graduations, Halloween, holidays, and custom events.

**Live site:** [party-planner-trek.vercel.app](https://party-planner-trek.vercel.app)

## Features

- **Party type selector** — switches theme, checklist defaults, and background music
- **Dashboard** — live overview of guests, budget, tasks, and next calendar event
- **Checklist** — add, check off, and reorder tasks per party type
- **Guest list** — track attendees with a live count
- **Budget tracker** — set a total budget, log expenses with vendor name and phone number
- **Notes** — freeform text for anything else
- **Multi-party calendar** — add and view events across months with color-coded party types
- **Background music** — themed audio per party type with a volume slider
- **Light / dark mode** — toggle in the settings panel
- **Drag to reorder** — rearrange sections between the main grid and the sidebar
- **Side navigation** — collapsible left nav with scroll-spy active states
- **Settings panel** — slide-in panel for music and theme controls
- **Persistent storage** — all data saved via cookies (no login required)

## Tech

- Vanilla HTML, CSS, and JavaScript — no frameworks
- [SortableJS](https://sortablejs.github.io/Sortable/) for drag-and-drop
- Cookie-based persistence
- Hosted on [Vercel](https://vercel.com)

## Files

| File | Purpose |
|------|---------|
| `index.html` | App structure and markup |
| `styles.css` | All styles and CSS variables for light/dark themes |
| `app.js` | All logic — state, rendering, drag, calendar, nav |
