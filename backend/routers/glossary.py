"""Quantum glossary routes."""

from fastapi import APIRouter, Query

from schemas import GlossaryTerm
from data.glossary_data import GLOSSARY_TERMS

router = APIRouter(prefix="/api/glossary", tags=["Glossary"])


@router.get("", response_model=list[GlossaryTerm])
def list_glossary():
    """Return all quantum glossary terms, sorted alphabetically."""
    return sorted(GLOSSARY_TERMS, key=lambda t: t.name)


@router.get("/search", response_model=list[GlossaryTerm])
def search_glossary(
    q: str = Query(..., min_length=1, description="Search query for glossary terms"),
):
    """
    Search glossary terms by name, definition, or category.

    Returns all terms where the query appears in the name, definition, or category
    (case-insensitive).
    """
    query_lower = q.lower()
    results = [
        term
        for term in GLOSSARY_TERMS
        if query_lower in term.name.lower()
        or query_lower in term.definition.lower()
        or query_lower in term.category.lower()
    ]
    return sorted(results, key=lambda t: t.name)
