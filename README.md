# NYP-ITJ174-Grp1

RightSkills training ecosystem prototype with a React client and Express server.

## What Changed In Prototype

### Platform and Runtime

- Added fallback placeholder backend mode when database connection fails.
- Added mode endpoint for frontend awareness:
	- GET /system/mode
- Added temporary placeholder login account for non-DB testing:
	- Email: temp@rightskills.local
	- Password: TempPass123!

### Frontend Functional Changes

- Updated top navigation and routes to align with registration-first flow.
- Added External Trainer Profile page with placeholder-only behavior:
	- Certificate upload validation (PDF, PNG, JPEG, max 5MB)
	- Visual certificate gallery updates
	- Success/error notifications
	- Professional experience form and chronological timeline
- Added Full-time Trainer Dashboard and drill-down detail pages using placeholders:
	- Clean assigned-course summary layout
	- Per-course status and progress visibility
	- Multi-course card organization
	- Per-course detailed breakdown view

### Project Structure / Cleanup

- Archived inactive client files under top-level inactive/client.
- Added inactive component manifests:
	- inactive/client/INACTIVE_COMPONENTS.md
	- inactive/server/INACTIVE_COMPONENTS.md

### Environment Tracking

- Updated ignore rules to allow tracking env files.
- Added committed env files:
	- client/.env
	- server/.env

## Tech Stack

- Client: React, Vite, MUI, Formik, Yup, React Toastify
- Server: Express, Sequelize, SQLite (default), MySQL2 (optional), JWT, Multer

## Repository Layout

- client: frontend app
- server: backend API
- inactive: archived components retained for reference

## Prerequisites

- Node.js 18+ recommended
- npm
- No extra DB setup required for default mode (SQLite file-based database)
- Optional for MySQL mode: MySQL server

## Environment Files

These files are already included in the repository:

- client/.env
- server/.env

Current defaults:

- Client API base URL points to http://localhost:3001
- Client file base URL points to http://localhost:3001/uploads/
- Server port is 3001
- Server uses SQLite by default with DB_DIALECT=sqlite and SQLITE_STORAGE=./data/rightskills.sqlite

## How To Start The Services

Open two terminals from the project root.

### 1) Install Dependencies

Client:

```bash
cd client
npm install
```

Server:

```bash
cd server
npm install
```

### 2) Start Backend

```bash
cd server
npm start
```

Expected behaviors:

- With default SQLite config: server starts in database mode and creates/uses server/data/rightskills.sqlite.
- If database initialization fails: server starts in placeholder mode and still serves API routes needed for demo flows.

Backend URL:

- http://localhost:3001

### 3) Start Frontend

```bash
cd client
npm run dev
```

Frontend URL:

- http://localhost:3000

## Quick Demo Login (Placeholder Mode)

Use this account when backend runs without DB setup:

- Email: temp@rightskills.local
- Password: TempPass123!

- Email for RS Officer: admin123@abc.com
- Password: P@ssw0rd

- Email for Trainer: test.trainer@rightskills.local
- Password: TrainerPass123!

- Email for Provider: provider@test.com
- Password: P@ssw0rd

## Main Routes (Client)

- / : landing
- /registration : ecosystem registration landing
- /trainer-profile : external trainer profile editor
- /trainer-dashboard : full-time trainer dashboard
- /trainer-dashboard/:id : course detail breakdown

## API Notes

Placeholder mode intentionally returns non-persistent responses for selected endpoints and demo-friendly placeholder data where applicable.

## Build Check

Frontend production build:

```bash
cd client
npm run build
```