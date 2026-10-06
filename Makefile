.PHONY: up down build logs db-migrate db-revision db-downgrade test lint format shell clean

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

db-migrate:
	alembic upgrade head

db-revision:
	alembic revision --autogenerate -m "$(msg)"

db-downgrade:
	alembic downgrade -1

test:
	pytest tests/ -v --cov=src

lint:
	ruff check src/ tests/

format:
	ruff format src/ tests/

shell:
	docker compose exec api python -m IPython

clean:
	docker compose down -v --remove-orphans
