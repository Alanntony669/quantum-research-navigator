"""File upload handling service."""

import os
import uuid
from pathlib import Path

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
if not os.path.isdir(UPLOAD_DIR):
    # When running from the backend directory, this resolves correctly.
    UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads")
    UPLOAD_DIR = os.path.abspath(UPLOAD_DIR)

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".docx", ".md"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def ensure_upload_dir() -> str:
    """Create the uploads directory if it doesn't exist and return its path."""
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    return UPLOAD_DIR


def validate_file(filename: str, file_size: int) -> tuple[bool, str]:
    """
    Validate a file's extension and size.

    Returns:
        A tuple of (is_valid, error_message).
    """
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"File type '{ext}' not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
    if file_size > MAX_FILE_SIZE:
        max_mb = MAX_FILE_SIZE / (1024 * 1024)
        return False, f"File too large. Maximum size is {max_mb:.0f} MB."
    return True, ""


def generate_stored_filename(original_name: str) -> str:
    """Generate a unique filename for storage while preserving the extension."""
    ext = Path(original_name).suffix.lower()
    unique_id = uuid.uuid4().hex[:12]
    stem = Path(original_name).stem[:50]  # Truncate long names
    return f"{stem}_{unique_id}{ext}"


def save_file(content: bytes, stored_filename: str) -> str:
    """
    Save file content to the uploads directory.

    Returns:
        The full path to the saved file.
    """
    upload_dir = ensure_upload_dir()
    filepath = os.path.join(upload_dir, stored_filename)
    with open(filepath, "wb") as f:
        f.write(content)
    return filepath


def delete_file(stored_filename: str) -> bool:
    """
    Delete a file from the uploads directory.

    Returns:
        True if the file was deleted, False if it didn't exist.
    """
    filepath = os.path.join(UPLOAD_DIR, stored_filename)
    if os.path.exists(filepath):
        os.remove(filepath)
        return True
    return False


def get_file_path(stored_filename: str) -> str | None:
    """Return the full path to a stored file, or None if it doesn't exist."""
    filepath = os.path.join(UPLOAD_DIR, stored_filename)
    return filepath if os.path.exists(filepath) else None
