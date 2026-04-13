# High-End Inventory Management System

## Overview
A modern inventory platform built with:
- Frontend: Responsive vanilla JS dashboard with analytics, filters, and export.
- Backend: Node.js + Express API with Socket.io real-time sync.
- Database: SQLite for lightweight, portable storage.

## Key Upgrades
- Smart item metadata: category, location, description, last updated.
- Real-time stock sync across clients.
- Inventory analytics: total SKUs, value, low stock, category breakdown.
- CSV export for reporting.
- Adaptive search, category filtering, and sorting.
- Quick stock adjustments from the table.

## Features
- Full CRUD with improved item form and metadata.
- Real-time updates via Socket.io.
- Low stock alerts and row highlighting.
- Category-based filtering and dynamic category list.
- Export inventory to CSV.
- Inventory summary widgets for value and stock health.

## Setup & Run
1. `npm install`
2. `npm run dev`
3. Open `http://localhost:3000`

## API Endpoints
- `GET /api/items` - list items with filters
- `GET /api/categories` - category list
- `GET /api/summary` - inventory analytics
- `GET /api/alerts` - low-stock alerts
- `POST /api/items` - add item
- `PUT /api/items/:id` - update item
- `PATCH /api/items/:id/stock` - adjust stock quantity
- `DELETE /api/items/:id` - delete item

## Notes
- The frontend is served statically from `frontend/`.
- Sample inventory items are generated automatically on first run.
- Use the export button to download current inventory as CSV.

## Folder Structure
- `frontend/`: UI assets and scripts
- `backend/`: API server and database access
- `database/`: SQLite storage and seed script
- Root: `package.json`, `README.md`

