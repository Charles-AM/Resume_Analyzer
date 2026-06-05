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
        try:
            reader = PdfReader(str(path))
            text = "\n".join(page.extract_text() or "" for page in reader.pages).strip()
        except Exception as exc:
            raise TextExtractionError(
                "We could not read this PDF. Try a text-based PDF or DOCX."
            ) from exc
        if not text:
            raise TextExtractionError(
                "This PDF did not contain readable text. Upload a text-based PDF or DOCX."
            )
        return text

    def _docx(self, path: Path) -> str:
        try:
            document = Document(str(path))
            text = "\n".join(paragraph.text for paragraph in document.paragraphs).strip()
        except Exception as exc:
            raise TextExtractionError(
                "We could not read this DOCX file. Try exporting it again."
            ) from exc
        if not text:
            raise TextExtractionError("This DOCX did not contain readable resume text.")
        return text
