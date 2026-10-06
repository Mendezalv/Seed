from pydantic import BaseModel, Field
from typing import TypeVar, Generic, Sequence, Any
from fastapi import Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

T = TypeVar('T')

class PaginationParams:
    def __init__(
        self,
        page: int = Query(1, ge=1, description='Numero da pagina'),
        per_page: int = Query(20, ge=1, le=100, description='Itens por pagina'),
    ):
        self.page = page
        self.per_page = per_page
        self.offset = (page - 1) * per_page

class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    per_page: int
    total_pages: int

async def paginate(session: AsyncSession, stmt: Any, pagination: PaginationParams) -> dict:
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = await session.scalar(count_stmt)
    
    paginated_stmt = stmt.offset(pagination.offset).limit(pagination.per_page)
    result = await session.scalars(paginated_stmt)
    items = result.all()
    
    total_pages = (total + pagination.per_page - 1) // pagination.per_page if total > 0 else 0
    
    return {
        "items": items,
        "total": total,
        "page": pagination.page,
        "per_page": pagination.per_page,
        "total_pages": total_pages
    }
