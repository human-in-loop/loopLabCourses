# Overview

The Loop Lab Course is a modern web application for AI-powered software development education. This is a full-stack TypeScript application built as a course enrollment platform where users can sign up for premium courses, particularly focusing on "Modern Software Development" with AI-assisted coding, automated testing, and cutting-edge development workflows.

The application serves as a landing page and course management system for Human in Loop AI Corp's educational offerings, featuring course listings, user authentication, enrollment management, and integration with external learning platforms like Moodle.

# User Preferences

Preferred communication style: Simple, everyday language.
Deployment preference: Firebase deployment over Replit environment.

# System Architecture

## Data Storage Migration (January 2025)
- **Migration Complete**: Successfully migrated from in-memory storage to MongoDB
- **Database**: MongoDB with persistent storage for all user data, courses, and enrollments
- **Connection**: MongoDB Atlas integration with automatic connection management
- **Fallback**: Graceful fallback to in-memory storage if MongoDB unavailable
- **Benefits**: User data, verification tokens, and enrollments now persist across server restarts

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
- **Database**: MongoDB with persistent document storage
- **Database Name**: LoopLabCourses
- **Collections**: 
  - `users` - User accounts with email, name, verification status, and TTL for cleanup
  - `Courses` - Course catalog and details
  - `enrollments` - User course enrollments and access control
- **Driver**: Official MongoDB Node.js driver with TypeScript support
- **Storage Interface**: Hybrid storage with MongoDB primary and in-memory fallback
- **TTL Policy**: Unverified users automatically deleted after 2 days
- **Session Storage**: Express sessions with in-memory storage (development)
- **Data Persistence**: All user data, verification tokens, and course enrollments persist across restarts

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

## Payment and Course Access System (January 2025)
- **Free vs Paid Courses**: Courses now support pricing in cents (0 = free)
- **Moneris Integration**: Complete payment processing with preload tickets and webhooks
- **Access Management**: Time-based access control with 10-day expiration after completion
- **Course Completion**: Tracking system for course progress and automatic access expiration
- **Firebase Deployment**: Configured for Firebase hosting and cloud functions
- **Security**: Webhook signature verification and secure payment processing

## Phase 3: Course Completion and Access Expiration (January 2025)
- **Lesson Progress Tracking**: Students can mark individual lessons as complete via POST /api/lessons/:id/complete
- **Progress Persistence**: All lesson completion data stored in database with timestamps
- **Admin Grading System**: Complete submission management with POST /api/admin/submissions/:id/grade
- **Automated Course Completion**: When admin grades final submission, course completion is triggered automatically
- **10-Day Access Expiration**: Upon course completion, access automatically expires 10 days later
- **Frontend Integration**: Course player includes lesson completion buttons and progress tracking
- **Database Schema**: Added lessonProgress and submissions tables for comprehensive tracking