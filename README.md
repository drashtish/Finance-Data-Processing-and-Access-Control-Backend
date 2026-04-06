# Finance Data Processing & Access Control API

A RESTful backend for managing financial records with role-based access control, built with Node.js, Express 5, TypeScript, Prisma 7, and SQLite.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Language | TypeScript |
| ORM | Prisma 7 |
| Database | SQLite (via libsql) |
| Auth | JWT (jsonwebtoken) |
| Validation | Zod v4 |
| Password Hashing | bcryptjs |

---

## Features

- **User & Role Management** — ADMIN can create/update users; three roles: `VIEWER`, `ANALYST`, `ADMIN`
- **Financial Records CRUD** — create, read, update, soft-delete records with full audit trail
- **Advanced Filtering** — filter by type, category, date range, amount range; sortable; paginated
- **Dashboard APIs** — summary totals, category breakdown, monthly/daily trends, recent activity
- **Role-Based Access Control** — enforced at every route via middleware
- **Input Validation** — Zod schemas on all request bodies and query params
- **Audit Logging** — every create/update/delete is logged with before/after state

---

## Role Permissions

| Action | VIEWER | ANALYST | ADMIN |
|---|---|---|---|
| Read records & dashboard | ✓ | ✓ | ✓ |
| Create / edit records | ✗ | ✓ | ✓ |
| Delete records (soft) | ✗ | ✗ | ✓ |
| View recent audit activity | ✗ | ✓ | ✓ |
| Manage users | ✗ | ✗ | ✓ |

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/drashtish/Finance-Data-Processing-and-Access-Control-Backend.git
cd Finance-Data-Processing-and-Access-Control-Backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Only `JWT_SECRET` is required — everything else works as-is. Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Then paste the output into `.env`:

```
DATABASE_URL="file:dev.db"
JWT_SECRET="your-strong-secret"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
```

### 3. Set up the database & seed

```bash
npx prisma db push          # create tables
npx prisma db seed          # seed sample users and records
```

> `npm install` automatically runs `prisma generate` to build the Prisma client.

### 4. Run the server

```bash
npm run dev                 # development (hot reload)
npm run build && npm start  # production
```

Server starts at `http://localhost:3000`

---

## Seed Accounts

| Email | Password | Role |
|---|---|---|
| admin@finance.dev | password123 | ADMIN |
| analyst@finance.dev | password123 | ANALYST |
| viewer@finance.dev | password123 | VIEWER |

---

## API Reference

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/v1/auth/login` | Public | Login, returns JWT |
| GET | `/api/v1/auth/me` | Any | Get current user |
| POST | `/api/v1/auth/logout` | Any | Logout |

### Users
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/v1/users` | ADMIN | List all users (paginated) |
| POST | `/api/v1/users` | ADMIN | Create a user |
| GET | `/api/v1/users/:id` | ADMIN | Get user by ID |
| PATCH | `/api/v1/users/:id` | ADMIN | Update role or status |

### Financial Records
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/v1/records` | All | List records (filtered, paginated) |
| POST | `/api/v1/records` | ANALYST, ADMIN | Create a record |
| GET | `/api/v1/records/:id` | All | Get record by ID |
| PATCH | `/api/v1/records/:id` | ANALYST, ADMIN | Update a record |
| DELETE | `/api/v1/records/:id` | ADMIN | Soft-delete a record |

**Query params for GET /records:**
`type`, `category`, `date_from`, `date_to`, `min_amount`, `max_amount`, `sort` (`date_asc`|`date_desc`|`amount_asc`|`amount_desc`), `page`, `limit`

### Dashboard
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/v1/dashboard/summary` | All | Income, expense, net balance totals |
| GET | `/api/v1/dashboard/by-category` | All | Breakdown per category |
| GET | `/api/v1/dashboard/trends` | All | Income vs expense over time |
| GET | `/api/v1/dashboard/recent-activity` | ANALYST, ADMIN | Audit log of recent changes |

---

## Response Format

### Success
```json
{
  "success": true,
  "data": { },
  "meta": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [{ "field": "email", "message": "Invalid email address" }]
  }
}
```

---

## Project Structure

```
src/
├── config/          # env, database connection
├── middleware/       # authenticate, requireRole, validate, errorHandler
├── modules/
│   ├── auth/        # login, logout, me
│   ├── users/       # user management
│   ├── records/     # financial records CRUD
│   └── dashboard/   # aggregation & reporting
├── types/           # Express type extensions
└── utils/           # errors, jwt, response helpers
prisma/
├── schema.prisma    # DB schema
└── seed.ts          # seed data
```

---

## Testing

A `test.http` file is included at the project root. Open it in VS Code with the **REST Client** extension (by Huachao Mao) to send requests interactively.
