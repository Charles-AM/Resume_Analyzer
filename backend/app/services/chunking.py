class ResumeChunker:
    def __init__(self, max_words: int = 180, overlap: int = 30):
        self.max_words = max_words
        self.overlap = overlap

    def chunk(self, text: str) -> list[str]:
        words = text.split()
        if not words:
            return []
        chunks: list[str] = []
        start = 0
        while start < len(words):
            end = min(start + self.max_words, len(words))
            chunks.append(" ".join(words[start:end]))
            if end == len(words):
                break
            start = max(0, end - self.overlap)
        return chunks
