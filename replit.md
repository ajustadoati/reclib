# RecoLib - Recommendation Vault

## Overview

RecoLib is a personal media recommendation tracker built as a cross-platform mobile application using React Native and Expo. The app allows users to capture, organize, and share media recommendations (books, movies, TV shows, music, podcasts) with AI-powered image recognition for quick entry. The core value proposition is "lightning-fast capture" - users can photograph media and have it automatically categorized using computer vision.

The project follows a full-stack architecture with an Express.js backend serving both API endpoints and the React Native/Expo frontend. Data is stored locally on-device using AsyncStorage for offline-first functionality, with PostgreSQL database schema defined for potential future cloud sync capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React Native with Expo SDK 54 (new architecture enabled)
- **Navigation**: React Navigation v7 with native stack and bottom tabs
- **State Management**: TanStack React Query for server state, React hooks for local state
- **Styling**: StyleSheet API with a centralized theme system (`client/constants/theme.ts`)
- **Animations**: React Native Reanimated for fluid micro-interactions
- **Path Aliases**: `@/` maps to `client/`, `@shared/` maps to `shared/`

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript with strict mode
- **API Style**: REST endpoints under `/api/` prefix
- **AI Integration**: OpenAI GPT-4o for image recognition via `/api/recognize` endpoint

### Data Layer
- **Local Storage**: AsyncStorage for on-device persistence (recommendations, settings)
- **Database Schema**: Drizzle ORM with PostgreSQL dialect (schema in `shared/schema.ts`)
- **Current State**: Database schema defined but app primarily uses local storage; ready for cloud sync implementation

### Key Design Patterns
- **Offline-First**: All recommendation data stored locally with AsyncStorage
- **Component Library**: Themed components (`ThemedText`, `ThemedView`, `Button`, `Card`) with dark/light mode support
- **Screen-Based Organization**: Each screen is self-contained in `client/screens/`
- **Shared Types**: Type definitions shared between client and server in `shared/` and `client/types/`

### Build and Development
- **Development**: Dual-process setup - Expo dev server + Express API server
- **Production Build**: Custom build script (`scripts/build.js`) for static export
- **Server Build**: esbuild for bundling server code

## External Dependencies

### AI Services
- **OpenAI API**: Used for image recognition and media identification
  - Environment variables: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`
  - Model: GPT-4o for vision tasks

### Database
- **PostgreSQL**: Connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Schema management and migrations in `migrations/` directory

### Key NPM Packages
- **expo-image-picker**: Camera and photo library access for capture flow
- **expo-camera**: Direct camera integration
- **expo-haptics**: Tactile feedback for interactions
- **expo-image**: Optimized image rendering
- **expo-blur/expo-glass-effect**: iOS-style blur effects for navigation

### Replit Integrations
The `replit_integrations/` folders contain pre-built utilities for:
- Audio/voice chat capabilities (speech-to-text, text-to-speech)
- Batch processing with rate limiting
- Chat conversation storage
- Image generation

These are available but not actively used in the main recommendation tracking flow.