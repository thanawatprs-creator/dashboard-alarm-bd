"""
Launcher for FastAPI backend server.
Runs on http://127.0.0.1:8000
"""
import uvicorn

if __name__ == "__main__":
    print("=" * 60)
    print(" Starting Dashboard Alarm BD - Backend (FastAPI + SQLite)")
    print(" Listening on: http://127.0.0.1:8000")
    print(" Swagger UI:    http://127.0.0.1:8000/docs")
    print(" Mode:          DEMO / SIMULATED DATA (Phase 1)")
    print("=" * 60)
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=False)

