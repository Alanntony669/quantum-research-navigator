"""Pydantic schemas for request/response validation."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ── Paper schemas ──────────────────────────────────────────────────────────────

class PaperResult(BaseModel):
    """Schema for a paper returned from arXiv search."""

    arxiv_id: str
    title: str
    authors: list[str]
    abstract: str
    published: str
    updated: Optional[str] = None
    pdf_link: str
    categories: list[str]
    doi: Optional[str] = None
    journal_ref: Optional[str] = None
    comment: Optional[str] = None
    primary_category: Optional[str] = None


class PaperSearchResponse(BaseModel):
    """Paginated response for paper search."""

    total_results: int
    start: int
    max_results: int
    papers: list[PaperResult]
    search_type: Optional[str] = "all"


# ── Bookmark schemas ───────────────────────────────────────────────────────────

class BookmarkCreate(BaseModel):
    """Schema for creating a new bookmark."""

    arxiv_id: str = Field(..., max_length=50)
    title: str = Field(..., max_length=500)
    authors: list[str]
    abstract: Optional[str] = None
    pdf_link: Optional[str] = None
    category: Optional[str] = None


class BookmarkResponse(BaseModel):
    """Schema for bookmark responses."""

    id: int
    arxiv_id: str
    title: str
    authors: list[str]
    abstract: Optional[str] = None
    pdf_link: Optional[str] = None
    category: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Document schemas ──────────────────────────────────────────────────────────

class DocumentResponse(BaseModel):
    """Schema for document metadata responses."""

    id: int
    filename: str
    original_name: str
    file_type: str
    file_size: float
    description: Optional[str] = None
    tags: list[str]
    uploaded_at: datetime

    model_config = {"from_attributes": True}


# ── Glossary schemas ──────────────────────────────────────────────────────────

class GlossaryTerm(BaseModel):
    """Schema for a single quantum glossary term with dual learning modes and math."""

    name: str
    definition: str
    category: str
    related_terms: list[str]
    intuitive_analogy: Optional[str] = None
    mathematical_formulation: Optional[str] = None
    interactive_demo_type: Optional[str] = None
    real_world_use: Optional[str] = None
    prerequisite_level: Optional[str] = "Beginner"


# ── Category schemas ──────────────────────────────────────────────────────────

class Category(BaseModel):
    """Schema for a research category."""

    name: str
    slug: str
    description: str
    arxiv_category: Optional[str] = None
