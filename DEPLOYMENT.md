# Deployment Guide: Acronymle

This guide outlines the steps to deploy the **Acronymle** application to a live environment.

## Phase 1: Preparation (Local)

### 1. Update Frontend API URL
Before building, ensure the frontend knows where your live backend will be.
- Open `frontend/public/acronymle.js`.
- Replace `YOUR_PYTHONANYWHERE_USERNAME` with `BrodyEhorn`.

### 2. Build the Frontend
Run the following command in the root directory:
```bash
npm run build
```
The production-ready files will be located in the `frontend/build` folder.

---

## Phase 2: Deploy Backend (PythonAnywhere)

### 1. Upload Files
- Upload the contents of your `backend/` directory to `/home/BrodyEhorn/Acronymle/backend/` on PythonAnywhere.
- Ensure `app.py`, `acronyms.db`, and `requirements.txt` are present.

### 2. Set Up Virtual Environment
Open a **Bash Console** on PythonAnywhere and run:
```bash
mkvirtualenv acronymle-venv --python=python3.10
pip install -r /home/BrodyEhorn/Acronymle/backend/requirements.txt
```

### 3. Configure Web App
In the **Web** tab:
- **Source code**: `/home/BrodyEhorn/Acronymle/backend`
- **Working directory**: `/home/BrodyEhorn/Acronymle/backend`
- **Virtualenv**: `/home/BrodyEhorn/.virtualenvs/acronymle-venv`

### 4. Edit WSGI Configuration
In the **Web** tab, click the link to the **WSGI configuration file** and update it:
```python
import sys
import os

# Set the path to your backend directory
path = '/home/BrodyEhorn/Acronymle/backend'
if path not in sys.path:
    sys.path.append(path)

# Set up the environment
os.chdir(path)
from app import app as application
```

---

## Phase 3: Deploy Frontend (Vercel/Netlify/GitHub Pages)

### Option A: Vercel/Netlify
1. Connect your GitHub repository.
2. Set the **Root Directory** to `frontend`.
3. Set the **Build Command** to `npm run build`.
4. Set the **Output Directory** to `build`.

### Option B: Manual Upload
Simply upload the contents of your local `frontend/build/` directory to any static hosting provider.

---

## Phase 4: Verification
1. Visit your frontend URL.
2. Open the browser console (F12) to ensure there are no "CORS" errors or "404" errors when fetching the solution.
3. Play a round to confirm the database connection is working!
