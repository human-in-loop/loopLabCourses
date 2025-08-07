# Overview

The Loop Lab Course is a modern web application for AI-powered software development education. This is a full-stack TypeScript application built as a course enrollment platform where users can sign up for premium courses, particularly focusing on "Modern Software Development" with AI-assisted coding, automated testing, and cutting-edge development workflows.

The application serves as a landing page and course management system for Human in Loop AI Corp's educational offerings, featuring course listings, user authentication, enrollment management, and integration with external learning platforms like Moodle.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing (lightweight React router alternative)
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom CSS variables for theming, featuring a dark "Loop Lab" brand theme
- **Animations**: Framer Motion for smooth animations and transitions
- **Form Handling**: React Hook Form with Zod validation via @hookform/resolvers

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **Development Setup**: Development server uses Vite middleware for hot module replacement
- **API Design**: RESTful API with consistent JSON responses and error handling middleware

## Data Storage Solutions
- **Database**: PostgreSQL with Neon serverless database hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Session Storage**: PostgreSQL-backed session storage for user authentication state

## Authentication and Authorization
- **Authentication Strategy**: Session-based authentication (no passwords - simplified email-only signup)
- **User Verification**: Automated email verification system with token-based validation (24-hour expiry)
- **Email Service**: Gmail SMTP integration for verification and welcome emails (free tier: 500 emails/day)
- **Access Control**: Course access is controlled through enrollment records with access flags
- **Session Management**: Server-side sessions stored in PostgreSQL with automatic cleanup
- **Fallback System**: Manual verification within 2 days if email service unavailable

## External Dependencies
- **Database Hosting**: Neon PostgreSQL serverless database
- **Email Service**: Gmail SMTP for user verification and notifications (using app passwords)
- **Email Integration**: Google Sheets API integration for user data collection (placeholder)
- **Learning Management**: Integration with Moodle platform for course delivery
- **Development Tools**: Replit-specific plugins for development environment integration
- **Icon System**: Font Awesome for icons throughout the application
- **Typography**: Google Fonts (Inter) for consistent typography

## Key Design Patterns
- **Separation of Concerns**: Clear separation between client, server, and shared code
- **Type Safety**: End-to-end TypeScript with shared schema definitions
- **Component Architecture**: Modular React components with reusable UI primitives
- **Progressive Enhancement**: Graceful fallbacks and loading states
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Error Boundaries**: Comprehensive error handling at multiple application layers

## Development Workflow
- **Hot Reload**: Vite-powered development with instant feedback
- **Type Checking**: Strict TypeScript configuration with path mapping
- **Build Process**: Optimized production builds with code splitting
- **Asset Management**: Integrated asset handling with proper imports and optimization