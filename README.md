# Electro Pi — Projects & Tasks API

A REST API for managing projects and tasks. Built with Node.js, TypeScript, Express, TypeORM, and PostgreSQL.

## API Docs

Import the api_docs.json file in PostMan to test the routes

## Setup

Add .env file in root, then run the following command:

```bash
docker compose up --build -d
```

`.env.example`:

```env
PORT=3000

DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=electro_pi

JWT_ACCESS_SECRET=change_me_access_secret
JWT_ACCESS_EXPIRES_IN=1h

PAGINATION_DEFAULT_LIMIT=20
PAGINATION_MAX_LIMIT=100
```

## Authorization

Two layers protect every request:

1. **JWT** — every request must include a valid Bearer token.
2. **Role/Membership** — `user` (default) can only access projects they belong to; `admin` can access everything.
