"""SQLAlchemy models for the Quantum Research Navigator."""

from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from sqlalchemy.sql import func

from database import Base


class Bookmark(Base):
    """Model for bookmarked arXiv papers."""

    __tablename__ = "bookmarks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    arxiv_id = Column(String(50), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    authors = Column(Text, nullable=False)  # JSON-encoded list of authors
    abstract = Column(Text, nullable=True)
    pdf_link = Column(String(500), nullable=True)
    category = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Document(Base):
    """Model for uploaded research documents."""

    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    filename = Column(String(255), nullable=False, unique=True)
    original_name = Column(String(255), nullable=False)
    file_type = Column(String(20), nullable=False)
    file_size = Column(Float, nullable=False)  # Size in bytes
    description = Column(Text, nullable=True)
    tags = Column(Text, nullable=True)  # JSON-encoded list of tags
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
