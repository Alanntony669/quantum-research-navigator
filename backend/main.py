"""Quantum Research Navigator — FastAPI Application Entry Point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import papers, bookmarks, documents, glossary, categories, navigator

# Create all database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Quantum Research Navigator API",
    description=(
        "An AI-powered research assistant for exploring quantum computing papers, "
        "deconstructing mathematical prerequisites, generating study roadmaps, "
        "and navigating live arXiv research."
    ),
    version="1.2.0",
)

# ── CORS Middleware ───────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Include Routers ──────────────────────────────────────────────────────────
app.include_router(navigator.router)
app.include_router(papers.router)
app.include_router(bookmarks.router)
app.include_router(documents.router)
app.include_router(glossary.router)
app.include_router(categories.router)


@app.get("/", tags=["Root"])
def root():
    """Health check / welcome endpoint."""
    return {
        "app": "Quantum Research Navigator",
        "version": "1.2.0",
        "docs": "/docs",
        "status": "running",
    }
