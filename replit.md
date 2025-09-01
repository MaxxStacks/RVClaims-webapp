# RVClaimTrack - RV Claims Management Platform

## Overview

RVClaimTrack is a comprehensive web application designed for Canadian RV dealerships to streamline and optimize their warranty claims processing. The platform provides end-to-end claims management with a focus on maximizing authorization rates and minimizing denials through expert preparation and industry knowledge. Built with modern web technologies, it features a professional landing page with bilingual support (English/French) and comprehensive contact management capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server for fast hot module replacement
- **Tailwind CSS** for utility-first styling with custom design system variables
- **shadcn/ui** component library providing pre-built, accessible UI components
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management and API communication
- **React Hook Form** with Zod validation for form handling and data validation

### Backend Architecture
- **Express.js** server with TypeScript for RESTful API endpoints
- **Memory-based storage** using in-memory data structures (Map) for contact management
- **Drizzle ORM** configured for PostgreSQL with schema definitions and migrations
- **Zod** for runtime schema validation and type safety
- **Modular route handling** with centralized error management

### Internationalization
- **Custom i18n system** with context-based language switching
- **localStorage persistence** for user language preferences
- **Comprehensive translation coverage** for all UI components and content
- **Bilingual support** for English and French markets

### Data Layer
- **PostgreSQL** database configured via Drizzle ORM
- **Neon Database** integration for serverless PostgreSQL hosting
- **Contact schema** with fields for dealership information, personal details, and inquiry data
- **Prepared statements** and type-safe queries through Drizzle

### UI/UX Design System
- **Design tokens** implemented through CSS custom properties
- **Consistent spacing and typography** using Tailwind's utility classes
- **Responsive design** with mobile-first approach
- **Accessibility features** including proper ARIA labels and keyboard navigation
- **Professional color scheme** with primary blue theme and neutral backgrounds

### Development Tools
- **TypeScript** configuration with strict type checking
- **ESBuild** for production bundling with Node.js compatibility
- **Path aliases** for clean import statements
- **Hot reload** during development with error overlays

## External Dependencies

### Database Services
- **Neon Database** - Serverless PostgreSQL hosting platform
- **Drizzle Kit** - Database migrations and schema management

### UI Framework & Components
- **Radix UI** - Comprehensive set of low-level UI primitives for accessibility
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library for consistent iconography
- **Class Variance Authority** - Utility for building component variants

### Development & Build Tools
- **Vite** - Fast build tool and development server
- **TypeScript** - Type safety and enhanced developer experience
- **PostCSS** - CSS processing with Autoprefixer
- **ESBuild** - Fast JavaScript bundler for production builds

### Form & Validation
- **React Hook Form** - Performant forms with minimal re-renders
- **Zod** - TypeScript-first schema validation
- **Hookform Resolvers** - Integration between React Hook Form and Zod

### State Management
- **TanStack Query** - Server state management and caching
- **React Context** - Local state management for language preferences

### Additional Integrations
- **Date-fns** - Date manipulation utilities
- **Replit-specific plugins** - Development environment integration
- **Google Fonts** - Typography (Inter, DM Sans, Fira Code, Geist Mono)