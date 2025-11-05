# Socratica

> An AI-powered math tutoring platform that guides students through problems using the Socratic method.

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Latest-orange)](https://firebase.google.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4--Turbo-green)](https://openai.com/)

## 🎯 Overview

**Socratica** is an AI-powered math tutoring platform that provides personalized, on-demand guidance to students through Socratic questioning. By eliminating the barriers of cost and scheduling that traditional tutors present, Socratica aims to democratize access to quality math education.

### What Makes Socratica Special

- **On-Demand Availability**: Available 24/7 whenever students need help
- **Affordable**: Free to ensure maximum accessibility
- **Socratic Method**: Guides students through discovery rather than giving direct answers
- **Personalized Guidance**: Adapts to each student's specific problem and confusion points in real-time
- **Image Input**: Students can upload screenshots/photos of math problems via OCR

### Core Philosophy

Socratica is designed as a **temporary learning crutch**. The app should require less and less use over time as students develop their problem-solving skills. Success means students progressing to higher difficulty levels they can solve independently.

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** or **yarn** package manager
- **Firebase account** for backend services
- **OpenAI API key** for LLM capabilities

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd socratica
   ```

2. **Install dependencies**
   ```bash
   cd socratica
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the `socratica/` directory with the following variables:
   
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key
   ```

   > **Note**: For Firebase setup, see the [Firebase Documentation](https://firebase.google.com/docs). For OpenAI API keys, visit [OpenAI Platform](https://platform.openai.com/api-keys).

4. **Initialize Firebase** (optional, if using Firebase CLI)
   ```bash
   firebase login
   firebase init
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🧪 Testing

Socratica uses a comprehensive testing strategy with both unit tests and end-to-end tests.

### Unit Tests (Vitest)

Run unit tests for components and utilities:

```bash
# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run
```

**Test Configuration:**
- Test framework: Vitest
- Test environment: jsdom
- Setup file: `vitest.setup.ts`
- Test files: `**/*.test.tsx` or `**/*.test.ts`

### End-to-End Tests (Playwright)

Run E2E tests to verify full user flows:

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed
```

**E2E Test Configuration:**
- Test framework: Playwright
- Browsers: Chromium, Firefox, WebKit
- Mobile: Mobile Chrome, Mobile Safari
- Base URL: `http://localhost:3000`
- Test directory: `tests/e2e/`

### Test Coverage

Tests are located alongside source files:
- Component tests: `components/**/__tests__/`
- Utility tests: `lib/**/__tests__/`
- E2E tests: `tests/e2e/`

## 🏗️ Architecture

### Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | Next.js | 15.0.0 |
| **Language** | TypeScript | Latest |
| **Styling** | Tailwind CSS | Latest |
| **Backend** | Firebase (Firestore, Auth, Storage) | Latest SDK |
| **AI/LLM** | OpenAI GPT-4 Turbo | gpt-4-turbo |
| **Math Rendering** | KaTeX | Latest |
| **Testing** | Vitest + Playwright | Latest |
| **Deployment** | Vercel | Platform |

### Project Structure

```
socratica/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── chat/         # Chat/LLM endpoints
│   │   └── ocr/          # OCR/Vision endpoints
│   ├── sessions/          # Sessions page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home/Chat interface
├── components/            # React components
│   ├── chat/             # Chat interface components
│   ├── math-renderer/    # Math rendering components
│   ├── problem-input/    # Problem input components
│   └── ui/               # UI components
├── lib/                   # Utilities and configurations
│   ├── firebase/         # Firebase setup and utilities
│   ├── openai/           # OpenAI integration
│   └── utils/            # General utilities
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── tests/                 # Test files
    └── e2e/              # End-to-end tests
```

### Key Features

- **Problem Input**: Text entry and image upload with OCR
- **Chat Interface**: Multi-turn dialogue with conversation history
- **Socratic Dialogue**: Guiding questions instead of direct answers
- **Math Rendering**: LaTeX-based equation rendering with KaTeX
- **Session Management**: Conversation history and problem tracking

## 📚 Documentation

- **[Product Requirements Document (PRD)](docs/PRD.md)** - Complete product requirements and specifications
- **[Product Brief](docs/product-brief-socratica-2025-11-03.md)** - Product vision and goals
- **[Architecture Document](docs/architecture.md)** - Technical architecture and design decisions
- **[Epics & Stories](docs/epics.md)** - Feature breakdown and implementation plan
- **[Test Specifications](docs/test-specifications.md)** - Detailed test specifications

## 🎨 Features

### MVP Features (Phase 1)

- ✅ **Problem Input**: Text and image upload with OCR
- ✅ **Chat Interface**: Multi-turn dialogue with LLM integration
- ✅ **Socratic Logic**: Guiding questions, not direct answers
- ✅ **Math Rendering**: LaTeX-based equation rendering
- ✅ **UI Polish**: Modern, accessible interface

### Future Features (Phase 2)

- 🔄 Interactive Whiteboard
- 🔄 Step Visualization
- 🔄 Voice Interface
- 🔄 Animated Avatar
- 🔄 Difficulty Modes
- 🔄 Problem Generation

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server

# Testing
npm test             # Run unit tests (Vitest)
npm run test:ui      # Run tests with UI
npm run test:e2e     # Run E2E tests (Playwright)
npm run test:e2e:ui  # Run E2E tests with UI

# Code Quality
npm run lint         # Run ESLint
```

### Code Style

- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with Next.js config
- **Formatting**: Prettier (recommended)
- **Components**: Functional components with TypeScript
- **Naming**: PascalCase for components, camelCase for functions

## 🚢 Deployment

Socratica is deployed on **Vercel** for optimal Next.js performance.

### Deployment Process

1. Push to `main` branch → Automatic production deployment
2. Push to feature branch → Preview deployment
3. Environment variables configured in Vercel dashboard

### Environment Variables

All environment variables must be configured in the Vercel dashboard:
- Firebase configuration variables (prefixed with `NEXT_PUBLIC_`)
- OpenAI API key (server-side only)

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For questions or suggestions, please contact the maintainers.

## 📧 Contact

For questions or support, please refer to the project documentation or contact the development team.

---

**Built with ❤️ for democratizing access to quality math education**
