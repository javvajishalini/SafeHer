from fastapi import FastAPI

app = FastAPI(title="SafeHer AI Service")

@app.get("/health")
def health_check():
    return {"status": "UP", "service": "SafeHer AI Service"}
