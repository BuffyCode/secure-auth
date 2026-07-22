# Secure Auth

## Backend

- Start the server: npm run dev
- Base URL: http://localhost:5000

### API endpoints
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/profile (requires Bearer token)
- GET /api/admin/dashboard (requires admin Bearer token)
- GET /api/user/dashboard (requires user/admin Bearer token)

## Frontend

- Start the client: npm run dev
- Vite will proxy /api requests to the backend.

