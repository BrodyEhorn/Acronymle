# Acronymle

**Acronymle** is a Wordle-inspired guessing game where players attempt to solve three-word acronyms (e.g., O.T.W. -> "On The Way"). The game provides feedback on correctness and word length to guide the user to the correct answer.

## Technology Stack

### Frontend
- **Framework**: React.js (located in `frontend/`)
- **Standalone Version**: A vanilla HTML/JS/CSS implementation is available in `frontend/public/acronymle.html` for direct browser play.
- **Styling**: Custom Vanilla CSS (`acronymle.css`).
- **Logic**: Vanilla JavaScript (`acronymle.js`) handles game state, keyboard interactions, and API communication.

### Backend
- **Core**: Python Flask (located in `backend/app.py`).
- **Database**: SQLite (`backend/acronyms.db`) stores the collection of acronyms.
- **API**: RESTful endpoints serve random acronyms to the frontend.
- **Legacy**: A Node.js/Express server (`server.js`) also exists as a reference/previous implementation.

### Infrastructure & Tooling
- **Monorepo Management**: NPM Workspaces.
- **Concurrent Execution**: `concurrently` is used to run both the frontend and backend servers with a single command (`npm run dev`).

## Project Structure
- `/frontend`: React application and public assets.
- `/backend`: Flask server, SQLite database, and seeding scripts.
- `/data`: JSON data backups.

## Documentation Guidelines

Gemini should update this file whenever significant project milestones or changes occur, specifically:
- **New Commands/Scripts**: When `package.json` or other scripts are added or modified.
- **Architecture Changes**: When switching frameworks (e.g., Node -> Flask) or changing data storage methods.
- **Conventions & Patterns**: When new coding styles, UI patterns, or project structures are established.
- **Major Features**: When core game mechanics or significant UI components are implemented.

## Recent Activity
- Combined frontend and backend start commands into `npm run dev`.
- Migrated backend to Flask (Python).
- Improved "Guesses" panel UI (widened to 500px, enabled wrapping for long words).
- Repositioned keyboard to the bottom of the screen.
- Extended the "Guesses" panel vertically.

