import pytest

from app.services.embeddings import EmbeddingProvider, cosine_similarity


@pytest.mark.asyncio
async def test_local_embeddings_are_deterministic_and_normalized():
    provider = EmbeddingProvider()
    first = (await provider.embed(["python aws rag"]))[0]
    second = (await provider.embed(["python aws rag"]))[0]
    assert first == second
    assert cosine_similarity(first, second) == pytest.approx(1.0)
