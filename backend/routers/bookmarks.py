"""Bookmark/reading list routes."""

import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Bookmark
from schemas import BookmarkCreate, BookmarkResponse

router = APIRouter(prefix="/api/bookmarks", tags=["Bookmarks"])


def _bookmark_to_response(bookmark: Bookmark) -> BookmarkResponse:
    """Convert a Bookmark ORM object to a BookmarkResponse, decoding the authors JSON."""
    authors = json.loads(bookmark.authors) if bookmark.authors else []
    return BookmarkResponse(
        id=bookmark.id,
        arxiv_id=bookmark.arxiv_id,
        title=bookmark.title,
        authors=authors,
        abstract=bookmark.abstract,
        pdf_link=bookmark.pdf_link,
        category=bookmark.category,
        created_at=bookmark.created_at,
    )


@router.post("", response_model=BookmarkResponse, status_code=201)
def create_bookmark(data: BookmarkCreate, db: Session = Depends(get_db)):
    """
    Save a paper to bookmarks.

    If a bookmark with the same arXiv ID already exists, returns 409 Conflict.
    """
    existing = db.query(Bookmark).filter(Bookmark.arxiv_id == data.arxiv_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Paper is already bookmarked.")

    bookmark = Bookmark(
        arxiv_id=data.arxiv_id,
        title=data.title,
        authors=json.dumps(data.authors),
        abstract=data.abstract,
        pdf_link=data.pdf_link,
        category=data.category,
    )
    db.add(bookmark)
    db.commit()
    db.refresh(bookmark)

    return _bookmark_to_response(bookmark)


@router.get("", response_model=list[BookmarkResponse])
def list_bookmarks(db: Session = Depends(get_db)):
    """Retrieve all bookmarked papers, ordered by most recently added."""
    bookmarks = db.query(Bookmark).order_by(Bookmark.created_at.desc()).all()
    return [_bookmark_to_response(b) for b in bookmarks]


@router.delete("/{bookmark_id}", status_code=204)
def delete_bookmark(bookmark_id: int, db: Session = Depends(get_db)):
    """Delete a bookmark by its ID."""
    bookmark = db.query(Bookmark).filter(Bookmark.id == bookmark_id).first()
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found.")
    db.delete(bookmark)
    db.commit()
