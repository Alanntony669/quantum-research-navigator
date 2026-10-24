"""Router for AI Paper Navigator and Study Roadmap Generation."""

from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Dict, Any, List

from services.navigator_service import (
    SAMPLE_PAPERS,
    extract_text_from_pdf_bytes,
    analyze_extracted_paper,
)

router = APIRouter(prefix="/api/navigator", tags=["AI Navigator"])


@router.get("/samples")
def list_sample_papers():
    """List landmark quantum computing papers available for instant sample analysis."""
    samples = []
    for sid, data in SAMPLE_PAPERS.items():
        meta = data["paper_meta"]
        samples.append({
            "sample_id": sid,
            "title": meta["title"],
            "authors": meta["authors"],
            "year": meta["year"],
            "pages": meta["pages"],
            "filename": meta["filename"],
        })
    return samples


@router.get("/sample/{sample_id}")
def get_sample_analysis(sample_id: str):
    """Get the verified analysis and study roadmap for a sample landmark paper."""
    if sample_id not in SAMPLE_PAPERS:
        raise HTTPException(status_code=404, detail="Sample paper not found.")
    return SAMPLE_PAPERS[sample_id]


@router.post("/analyze")
async def analyze_pdf_paper(file: UploadFile = File(...)):
    """
    Upload a quantum research paper in PDF format.

    Extracts text, explains research problem & methodology in plain language,
    identifies mathematical prerequisites, and generates an ordered study roadmap.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF research documents are supported.")

    content = await file.read()
    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 20MB.")
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        pdf_info = extract_text_from_pdf_bytes(content)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not read PDF document: {str(e)}")

    if pdf_info["word_count"] < 30:
        raise HTTPException(
            status_code=422,
            detail="The PDF contains very little or no readable text. It may be an image scan or corrupted.",
        )

    analysis = analyze_extracted_paper(pdf_info, filename=file.filename)
    return analysis
