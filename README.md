# Seed - Hub de Gestão e Inteligência Agropecuária

O Seed é um sistema avançado para gestão e inteligência agropecuária, facilitando o controle de propriedades, produção e indicadores agrícolas utilizando Python e FastAPI.

## Pré-requisitos

*   Docker
*   Docker Compose
*   Python 3.12+ (para desenvolvimento local)

## Inicialização Rápida

Para iniciar o projeto localmente com Docker, execute:

```bash
make up
```

Após os containers estarem rodando, aplique as migrações no banco de dados:

```bash
make db-migrate
```

O servidor da API estará disponível em `http://localhost:8000`.

## Estrutura do Projeto

O projeto segue os princípios de Domain-Driven Design (DDD):

*   `src/domain/models.py`: Modelos SQLAlchemy para persistência e lógica de domínio principal.
*   `src/domain/schemas.py`: Esquemas Pydantic para validação e serialização de dados (entradas e saídas).
*   `src/application/services.py`: Serviços da aplicação e regras de negócio.
*   `src/api/routes.py`: Endpoints do FastAPI, tratamento de requisições e injeção de dependências.

## Stack Tecnológica

*   **Backend**: Python 3.12+, FastAPI, Uvicorn
*   **Banco de Dados**: PostgreSQL 16 com PostGIS (via asyncpg e SQLAlchemy 2.0+)
*   **Filas / Background Jobs**: Celery e Redis
*   **Migrações**: Alembic
*   **Validação de Dados**: Pydantic v2
*   **Testes**: pytest, pytest-asyncio, factory-boy
*   **Outros**: uuid-utils (uuid7), structlog

## Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
