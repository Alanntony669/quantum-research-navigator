"""Paper search & management routes using arXiv API."""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from schemas import PaperSearchResponse
from services.arxiv_service import search_papers, fetch_trending

router = APIRouter(prefix="/api/papers", tags=["Papers"])


@router.get("/search", response_model=PaperSearchResponse)
async def search(
    query: str = Query(..., min_length=1, description="Search query string"),
    start: int = Query(0, ge=0, description="Pagination offset"),
    max_results: int = Query(10, ge=1, le=50, description="Number of results to return"),
    search_type: str = Query("all", description="Search target: all, author, title, abstract"),
    category: Optional[str] = Query(None, description="arXiv category code to filter (e.g. quant-ph)"),
):
    """
    Search arXiv for papers matching query, author name, or paper title.

    - **query**: Keyword, author name, or research paper title.
    - **search_type**: 'all' (default), 'author', 'title', or 'abstract'.
    - **category**: Optional filter by arXiv category (e.g. 'quant-ph', 'cs.QC').
    """
    try:
        total, papers = await search_papers(
            query=query,
            start=start,
            max_results=max_results,
            search_type=search_type,
            category=category,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch from arXiv API: {str(e)}")

    return PaperSearchResponse(
        total_results=total,
        start=start,
        max_results=max_results,
        papers=papers,
        search_type=search_type,
    )


@router.get("/trending", response_model=PaperSearchResponse)
async def trending(
    category: str = Query("quant-ph", description="arXiv category code (e.g. quant-ph, cs.QC)"),
    max_results: int = Query(10, ge=1, le=50, description="Number of results to return"),
):
    """
    Fetch recent/trending papers for a given arXiv category.

    Sorted by submission date (most recent first).
    """
    try:
        total, papers = await fetch_trending(category, max_results)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch from arXiv API: {str(e)}")

    return PaperSearchResponse(
        total_results=total,
        start=0,
        max_results=max_results,
        papers=papers,
        search_type="trending",
    )
