"""Document upload routes."""

import json

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from models import Document
from schemas import DocumentResponse
from services.file_service import validate_file, generate_stored_filename, save_file, delete_file, get_file_path

router = APIRouter(prefix="/api/documents", tags=["Documents"])


def _document_to_response(doc: Document) -> DocumentResponse:
    """Convert a Document ORM object to a DocumentResponse, decoding the tags JSON."""
    tags = json.loads(doc.tags) if doc.tags else []
    return DocumentResponse(
        id=doc.id,
        filename=doc.filename,
        original_name=doc.original_name,
        file_type=doc.file_type,
        file_size=doc.file_size,
        description=doc.description,
        tags=tags,
        uploaded_at=doc.uploaded_at,
    )


@router.post("/upload", response_model=DocumentResponse, status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),  # Comma-separated tags
    db: Session = Depends(get_db),
):
    """
    Upload a research document (PDF, TXT, DOCX, MD).

    - **file**: The document file (max 10 MB).
    - **description**: Optional description of the document.
    - **tags**: Optional comma-separated tags (e.g. "quantum,research,notes").
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    # Read file content
    content = await file.read()
    file_size = len(content)

    # Validate
    is_valid, error_msg = validate_file(file.filename, file_size)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    # Generate stored filename and save
    stored_name = generate_stored_filename(file.filename)
    save_file(content, stored_name)

    # Parse tags
    tag_list: list[str] = []
    if tags:
        tag_list = [t.strip() for t in tags.split(",") if t.strip()]

    # Determine file type
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "unknown"

    # Store metadata in database
    document = Document(
        filename=stored_name,
        original_name=file.filename,
        file_type=ext,
        file_size=file_size,
        description=description,
        tags=json.dumps(tag_list),
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    return _document_to_response(document)


@router.get("", response_model=list[DocumentResponse])
def list_documents(db: Session = Depends(get_db)):
    """List all uploaded documents, ordered by most recently uploaded."""
    documents = db.query(Document).order_by(Document.uploaded_at.desc()).all()
    return [_document_to_response(d) for d in documents]


@router.delete("/{document_id}", status_code=204)
def delete_document(document_id: int, db: Session = Depends(get_db)):
    """Delete a document by its ID (removes both file and database record)."""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")

    # Delete the physical file
    delete_file(document.filename)

    # Delete database record
    db.delete(document)
    db.commit()


@router.get("/{document_id}/download")
def download_document(document_id: int, db: Session = Depends(get_db)):
    """Download a document by its ID."""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")

    filepath = get_file_path(document.filename)
    if not filepath:
        raise HTTPException(status_code=404, detail="File not found on disk.")

    return FileResponse(
        path=filepath,
        filename=document.original_name,
        media_type="application/octet-stream",
    )
