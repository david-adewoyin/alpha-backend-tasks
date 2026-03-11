from fastapi import FastAPI

from app.api import health_router, briefings_router

app = FastAPI(title="InsightOps Starter Service", version="0.1.0")

app.include_router(health_router)
app.include_router(briefings_router)

@app.get("/")
def root() -> dict[str, str]:
    return {"service": "InsightOps", "status": "starter-ready"}