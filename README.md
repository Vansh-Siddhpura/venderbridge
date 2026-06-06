# VendorBridge

A full-stack procurement management platform for managing vendors, RFQs, quotations, purchase orders, and invoices.

## Tech Stack

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT (access + refresh tokens)
- **Validation**: Zod

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v3 + Vanilla CSS
- **State**: Zustand (auth), TanStack Query (server state)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js >= 18
- Docker & Docker Compose (for PostgreSQL)

### Backend Setup
```bash
cd backend
cp .env.example .env
docker-compose up -d       # Start PostgreSQL + pgAdmin
npm install
npx prisma migrate dev     # Run migrations
npm run dev                # Start dev server on :5000
```

### Frontend Setup
```bash
cd frontend
cp .env.example .env
npm install
npm run dev                # Start dev server on :5173
```

### Services
| Service    | URL                    |
|-----------|------------------------|
| Backend   | http://localhost:5000   |
| Frontend  | http://localhost:5173   |
| pgAdmin   | http://localhost:5050   |

## Project Structure

```
VendorBridge/
├── backend/
│   ├── prisma/              # Schema & migrations
│   ├── src/
│   │   ├── config/          # Environment, database config
│   │   ├── middlewares/     # Auth, error handling
│   │   ├── modules/         # Feature modules (auth, vendors, rfqs, etc.)
│   │   ├── types/           # Shared TypeScript types
│   │   ├── utils/           # Helper functions
│   │   ├── app.ts           # Express app setup
│   │   └── server.ts        # Server entry point
│   └── docker-compose.yml
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios client & API calls
│   │   ├── components/      # Shared & UI components
│   │   ├── features/        # Feature pages (by domain)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── layouts/         # App & Auth layouts
│   │   ├── router/          # Route definitions
│   │   ├── stores/          # Zustand stores
│   │   ├── types/           # TypeScript types & enums
│   │   └── utils/           # Formatters & helpers
│   └── index.html
└── README.md
```

## License
ISC
