from pathlib import Path

from docx import Document
from pypdf import PdfReader


class TextExtractionError(ValueError):
    pass


class TextExtractor:
    def extract(self, path: Path) -> str:
        suffix = path.suffix.lower()
        if suffix == ".pdf":
            return self._pdf(path)
        if suffix == ".docx":
            return self._docx(path)
        if suffix in {".txt", ".md"}:
            return path.read_text(encoding="utf-8", errors="ignore")
        raise TextExtractionError(f"Unsupported file type: {suffix}")

    def _pdf(self, path: Path) -> str:
        reader = PdfReader(str(path))
        return "\n".join(page.extract_text() or "" for page in reader.pages).strip()

    def _docx(self, path: Path) -> str:
        document = Document(str(path))
        return "\n".join(paragraph.text for paragraph in document.paragraphs).strip()
