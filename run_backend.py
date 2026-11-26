"""
Launcher for FastAPI backend server.
Supports PORT environment variable for Render/cloud deployment.
"""
import os
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print("=" * 60)
    print(" Starting Dashboard Alarm BD - Backend (FastAPI + SQLite)")
    print(f" Listening on: http://0.0.0.0:{port}")
    print(f" Swagger UI:    http://0.0.0.0:{port}/docs")
    print(" Mode:          DEMO / SIMULATED DATA (Phase 1)")
    print("=" * 60)
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=False)

