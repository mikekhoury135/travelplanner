# Travel Planner

A React + TypeScript prototype for planning vacation logistics in one place. The app lets you log every airfare, hotel, and
rental car option you're considering, mark preferred choices, and see the combined trip cost update instantly. Data is stored
locally in the browser today, with the architecture ready for a future account-based backend.

## Features

- ✈️ **Air travel tracker** – capture airline, flight code, route, departure time, CAD fare, and optional points + partner.
- 🏨 **Hotel log** – record hotel name, city, star rating, address, contact information, stay dates, and price.
- 🚗 **Rental car quotes** – keep pickup/drop-off details, daily rates, and date ranges for ground transportation.
- ✅ **Selectable itinerary summary** – mark the options you like best and review totals for each category plus a grand total.
- 💾 **Local caching** – travel data is persisted to `localStorage`, but the `TravelDataStore` interface makes it easy to swap in
  a remote persistence layer later.

## Getting started

```bash
npm install
npm run dev
```

The development server runs on [http://localhost:5173](http://localhost:5173). Update the forms to add options, then mark items
as "Select" to include them in the itinerary summary.

## Available scripts

- `npm run dev` – start the Vite development server.
- `npm run build` – generate a production build.
- `npm run preview` – preview the production build locally.
- `npm run lint` – run the configured ESLint rules.

## Project structure

```
src/
├── components/        # Forms, lists, and summary UI components
├── context/           # Application state management + persistence integration
├── services/          # Local storage adapter implementing the persistence interface
├── utils/             # Formatting helpers
├── App.tsx            # Page layout tying everything together
└── main.tsx           # Application entry point + provider wiring
```

## Next steps

- Introduce authentication and replace the local storage adapter with an API-backed persistence layer.
- Expand itinerary categories (experiences, dining, trains) and add budgeting insights.
- Enable collaboration so friends or family can co-plan the same trip.
