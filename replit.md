# Brick Cart Verify

## Overview

Brick Cart Verify is a multi-role e-commerce platform built with React, TypeScript, and Express. The application facilitates transactions between customers, sellers, and administrators with a verification-based order workflow. The platform uses a PostgreSQL database via Neon serverless and implements JWT-based authentication with role-based access control.

The application features a three-tier user system (customers, sellers, admins) where orders go through a verification process involving both seller and buyer confirmation before fulfillment. Products are organized by categories with seller-based inventory management and pincode-based delivery serviceability.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript
- Vite as the build tool and development server
- TanStack Query (React Query) for server state management
- React Router for client-side routing
- Shadcn UI components built on Radix UI primitives
- Tailwind CSS for styling with Material 3-inspired design system

**Design Decisions:**
- Component-based architecture with separation of concerns between UI components (`src/components/ui/`) and business logic components
- Protected route pattern for role-based access control using a custom `ProtectedRoute` wrapper
- Context-based authentication state management via `AuthProvider`
- Gradient-based visual design language using blue-to-purple color schemes defined in CSS custom properties
- Mobile-responsive design with dedicated hooks for device detection

**Routing Strategy:**
- Role-based redirect on login: customers to `/customer`, sellers to `/seller`, admins to `/admin`
- Protected routes enforce authentication and role-based permissions
- Fallback 404 page for unmatched routes

### Backend Architecture

**Technology Stack:**
- Express.js server with TypeScript
- Cookie-based JWT authentication
- Drizzle ORM for database operations
- Neon serverless PostgreSQL with WebSocket support
- bcrypt for password hashing

**Design Decisions:**
- Monolithic server handling both API routes and static file serving in production
- Vite middleware integration in development for hot module replacement
- Storage abstraction layer (`server/storage.ts`) implementing repository pattern for database operations
- Centralized authentication middleware with role-based access control
- Cookie-based sessions (httpOnly, secure) instead of bearer tokens for enhanced security

**API Structure:**
- RESTful API endpoints under `/api` prefix
- Auth routes: `/api/auth/signup`, `/api/auth/signin`, `/api/auth/session`, `/api/auth/signout`
- Resource routes following standard CRUD patterns for profiles, products, orders, sellers, and addresses
- Middleware stack: JSON parsing → Cookie parsing → Authentication → Route handlers

### Database Schema

**ORM Choice:**
- Drizzle ORM chosen for type-safe database operations and PostgreSQL compatibility
- Schema-first approach with TypeScript definitions in `shared/schema.ts`

**Core Entities:**
1. **Profiles** - Base user table with role enumeration (customer, seller, admin)
2. **User Addresses** - Multiple addresses per user with cascade deletion
3. **Sellers** - Extended profile for seller-specific data (shop name, status)
4. **Seller Pincodes** - Delivery serviceability by pincode per seller
5. **Products** - Inventory items with JSONB for images and flexible attributes
6. **Orders** - Order records with state machine workflow
7. **Order State History** - Audit trail for order status changes
8. **Payments** - Payment tracking with method and status enums

**Key Design Patterns:**
- Enum types for constrained values (roles, order status, payment status)
- Timestamp tracking (createdAt, updatedAt) for audit purposes
- JSONB fields for flexible, schema-less data (product images, order items, delivery addresses)
- Foreign key relationships with cascade delete for data integrity
- UUID primary keys for distributed system compatibility

### Authentication & Authorization

**Authentication Flow:**
- Password hashing using bcrypt with 10 salt rounds
- JWT tokens with 7-day expiration stored in httpOnly cookies
- Token payload includes userId and role for authorization
- Session validation endpoint for client-side authentication state

**Authorization Strategy:**
- Role-based access control (RBAC) with three roles: customer, seller, admin
- Middleware functions `authMiddleware` and `requireRole` for endpoint protection
- Profile sanitization removes password hashes before sending to client
- Role-specific UI rendering and route access on frontend

**Security Considerations:**
- Passwords never stored in plaintext
- JWT secret configurable via environment variable
- HttpOnly cookies prevent XSS attacks
- Cookie-based sessions simplify CSRF protection

### Order Workflow State Machine

**Status Flow:**
- created → pending_verification → seller_contacted → seller_accepted/rejected
- seller_accepted → buyer_contacted → buyer_confirmed/rejected
- buyer_confirmed → confirmed → out_for_delivery → delivered → completed
- Alternative: rejected at any verification step

**Design Rationale:**
- Manual verification process ensures order accuracy and reduces fraud
- State history tracking provides complete audit trail
- Admin intervention points at seller and buyer contact stages
- Separate payment tracking allows for partial payments and COD support

## External Dependencies

### Third-Party Services

**Neon Database (PostgreSQL):**
- Serverless PostgreSQL database hosting
- WebSocket connection support for real-time capabilities
- Connection pooling via `@neondatabase/serverless` package
- Environment variable: `DATABASE_URL` (required)

**UI Component Libraries:**
- Radix UI primitives for accessible, unstyled components
- Shadcn UI configuration with customized Tailwind theme
- Lucide React for iconography

**Authentication & Security:**
- jsonwebtoken for JWT creation and verification
- bcrypt for password hashing
- cookie-parser for cookie handling middleware

**Build & Development Tools:**
- Vite for fast development and optimized production builds
- TypeScript for type safety across frontend and backend
- Drizzle Kit for database migrations
- ESLint with TypeScript support for code quality

**State Management & Data Fetching:**
- TanStack Query for server state management with caching
- React Hook Form with Zod resolvers for form validation

### Configuration Requirements

**Environment Variables:**
- `DATABASE_URL` - Neon PostgreSQL connection string (required)
- `JWT_SECRET` - Secret key for JWT signing (defaults to development key, should be changed in production)
- `NODE_ENV` - Environment mode (development/production)
- `PORT` - Server port (defaults to 5000)

**Package Manager:**
- npm for dependency management
- Node.js runtime required (managed via nvm recommended)

**Development vs. Production:**
- Development: Vite dev server with HMR, loose TypeScript checking
- Production: Static file serving from `dist/`, strict build settings