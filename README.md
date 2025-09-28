# Travel Planner

A lightweight travel budgeting dashboard that runs entirely in the browser. Add flight, hotel, rental
car, and train options, mark your favourites, and compare cash and points totals without signing in
or running a dev server. All data lives in `localStorage`, so the app works offline-friendly today
and can later be wired up to a backend account system.

## Features

- Capture detailed flight information including connections, duration, CAD pricing, and points.
- Track hotel stays with check-in/out dates, optional address/contact fields, and price estimates.
- Record rental car quotes and automatically calculate multi-day totals when selected.
- Plan rail segments with departure times, station details, and pricing.
- Inline editing for every entry plus selection toggles to build an itinerary summary.
- Live summary panel that aggregates cash totals, points requirements, and rental durations.

## Getting started

No build tools are required—the project is just static HTML, CSS, and JavaScript. Clone the repo and
open `index.html` directly in your browser of choice:

```sh
# from the repository root
open index.html              # macOS
xdg-open index.html          # Linux
start index.html             # Windows
```

If you prefer to serve the files locally, any static HTTP server will work (for example `python -m
http.server`).

## Deployment to GitHub Pages

Because the site is static, you can deploy it by pointing GitHub Pages at the repository or a `docs/`
folder—no bundler output is required. After pushing to `main`:

1. In your repository settings, open **Pages**.
2. Select **Deploy from a branch** and choose the branch + folder that contains `index.html` (usually
   `main` and `/root`).
3. Save. GitHub Pages will serve the application as-is, and future commits update it automatically.

## Data persistence

All entries are stored in the browser's `localStorage` under the key `travel-planner-data-v2`. Each
load sanitizes stored records so older data keeps working even as new fields are introduced. Clearing
the browser storage (or using the "Clear all data" button in the UI) resets the app.

## Roadmap

- Plug the existing data layer into an account-backed API when authentication becomes available.
- Export itineraries for sharing with travel companions.
- Surface analytics such as nightly averages and cost breakdowns per city.
