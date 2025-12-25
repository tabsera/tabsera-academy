# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev      # Start Vite dev server (http://localhost:5173)
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

No test or lint commands are currently configured.

## Environment Configuration

Copy `.env.example` to `.env`. Key variables:
- `VITE_API_URL` - Backend API URL (default: http://localhost:8000/api)
- `VITE_ENABLE_MOCK_API=true` - Enable mock API for offline development
- `VITE_ENABLE_DEMO_MODE=true` - Enable demo mode features

## Tech Stack

- React 18 with React Router v6 (nested routes, layout routes)
- Vite 5 build tool
- Tailwind CSS (utility-first, no component library)
- Lucide React icons
- Context API for state management (no Redux)

## Architecture Overview

### User Roles & Portals

Three distinct user roles with separate portal layouts:
1. **STUDENT** - Course browsing, enrollment, learning dashboard (`/student/*`)
2. **CENTER_ADMIN** - Learning center management (`/center/*`)
3. **TABSERA_ADMIN** - Platform administration (`/admin/*`)

### Directory Structure

```
src/
├── api/           # HTTP client, auth methods, mock API
├── components/    # Shared UI components (Header, Footer, Layout, ProtectedRoute)
├── context/       # AuthContext (auth state), CartContext (shopping cart)
├── layouts/       # Portal-specific layouts (AdminLayout, CenterLayout, StudentLayout)
├── hooks/         # Custom hooks (useAuth)
├── pages/         # Page components organized by portal
│   ├── public/    # Student-facing pages (Home, Courses, Centers)
│   ├── auth/      # Login, Register, ForgotPassword, ResetPassword
│   ├── admin/     # Admin portal (16 pages)
│   ├── center/    # Learning center portal (5 pages)
│   ├── student/   # Student portal (5 pages)
│   └── checkout/  # Cart, Checkout, OrderConfirmation
└── utils/         # Mock data for development
```

### State Management

- **AuthContext** - User authentication, role checking, token management (localStorage)
- **CartContext** - Shopping cart with promo code support (persisted to localStorage)

### API Layer

- `src/api/client.js` - Base HTTP client with automatic token refresh on 401
- `src/api/auth.js` - Authentication endpoints
- `src/api/mockApi.js` - Mock implementations activated via `VITE_ENABLE_MOCK_API`

### Route Protection

- `ProtectedRoute` component wraps authenticated routes
- Routes redirect based on user role
- Public pages use `Layout` component; portals use role-specific layouts

## Design Patterns

- Primary color: Blue-600 (#2563eb)
- Cards: `rounded-2xl shadow-sm border-gray-100`
- Buttons: `rounded-xl font-semibold`
- Inputs: `rounded-xl border-gray-200 focus:ring-2`
- Path alias: `@` resolves to `/src`
