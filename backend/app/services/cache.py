import json
from collections.abc import Awaitable, Callable
from typing import TypeVar

from redis.asyncio import Redis

from app.core.config import get_settings

T = TypeVar("T")


class Cache:
    def __init__(self) -> None:
        self.client = Redis.from_url(get_settings().redis_url, decode_responses=True)

    async def get_or_set(self, key: str, factory: Callable[[], Awaitable[T]], ttl_seconds: int = 900) -> T:
        cached = await self.client.get(key)
        if cached:
            return json.loads(cached)
        value = await factory()
        await self.client.setex(key, ttl_seconds, json.dumps(value))
        return value
