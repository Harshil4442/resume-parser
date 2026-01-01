# AI Resume Parser (Frontend on Vercel + Backend on Google Cloud Run)

This project is a full‑stack AI Resume Copilot:
- **Frontend:** Next.js (Vercel)
- **Backend:** FastAPI (Google Cloud Run)
- **Database:** SQLite by default (single file). On Cloud Run you should use a managed DB (Postgres) if you need persistence across restarts.

## ✅ What’s new in this version

### 1) Real user accounts + user‑wise data
Previously the frontend hard‑coded `user_id=1`, so everyone saw/overwrote the same data.

Now:
- Users can **register/login**
- Backend issues a **JWT access token**
- Every record (`Resume`, `JobMatch`) is automatically tied to the **current user** (from JWT)
- All reads/writes are filtered by `current_user.id`

### 2) Much larger Learning resources
The Learning page now recommends resources for many technologies (Python, JS/TS, React/Next, databases, DevOps, cloud, ML, etc.) based on your **latest uploaded resume**.

Resource list is stored in: `backend/resources/courses.json`.

## Project structure

```
backend/   # FastAPI (Cloud Run)
frontend/  # Next.js (Vercel)
```

---

## Backend (Cloud Run)

### 1) Required environment variables
Set these in Cloud Run:

- `DATABASE_URL`  
  - Local dev example: `sqlite:///./app.db`
  - Cloud Run example (recommended): use **Postgres** and set a full SQLAlchemy URL.
- `JWT_SECRET` (**required in production**)  
  - Use a long random string.
- Optional:
  - `FRONTEND_ORIGINS` = `https://YOUR_VERCEL_DOMAIN` (or `*` for quick testing)
  - `ACCESS_TOKEN_EXPIRE_MINUTES` (default 7 days)

### 2) Run locally
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Health:
- `GET http://localhost:8000/api/health`

### 3) Deploy to Cloud Run (from your laptop)
Run from the **backend folder**:

```bash
cd backend

gcloud run deploy ai-resume-parser   --source .   --region us-central1   --allow-unauthenticated   --memory 1Gi
```

Then set env vars:

```bash
gcloud run services update ai-resume-parser   --region us-central1   --set-env-vars JWT_SECRET="CHANGE_ME_LONG_RANDOM",FRONTEND_ORIGINS="https://YOUR_VERCEL_DOMAIN"
```

---

## Frontend (Vercel)

### 1) Environment variable
In Vercel → Project → Settings → Environment Variables:

- `NEXT_PUBLIC_API_BASE_URL` = `https://YOUR_CLOUD_RUN_URL/api`

### 2) Run locally
```bash
cd frontend
npm install
npm run dev
```

---

## How to use

1. Open the frontend
2. Go to **/register** and create an account
3. Go to **Resume** and upload your PDF
4. Use the returned **Resume ID** on **Match**
5. Go to **Learning** → it will compute skill gaps from your **latest resume**
6. Dashboard shows analytics for **your account only**

---

## Notes / common issues

- If you see `401 Not authenticated`, you are not logged in (or token is missing).  
  Login again and retry.
- If Cloud Run memory errors happen, increase memory:
  - `--memory 1Gi` or `--memory 2Gi`
- If your database resets on Cloud Run, that’s because SQLite inside the container is ephemeral. Use managed Postgres for real persistence.
