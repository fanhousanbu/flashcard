# 久记闪卡 (EverRecall)

A smart flashcard learning application built with React + TypeScript + Supabase, featuring spaced repetition algorithms and a card marketplace.

## Features

- **Scientific Memory**: Spaced repetition system based on the SM-2 algorithm
- **Deck Management**: Create, edit, and delete study decks
- **Markdown Support**: Rich text card editing with Markdown
- **Dual Study Modes**: Spaced repetition + Simple review
- **Card Marketplace**: Publish and import study decks
- **Data Security**: Soft delete with data recovery support
- **Responsive Design**: Adapts to all screen sizes
- **Theme Switching**: Light/Dark mode support

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite
- React Router v7
- Zustand (state management)
- Tailwind CSS
- React Markdown
- Sonner (toast notifications)

### Backend
- Supabase (BaaS)
  - PostgreSQL database
  - Authentication
  - Row Level Security (RLS)
  - Storage

## Getting Started

### 1. Clone and Install

```bash
cd flashcard
npm install
```

### 2. Configure Supabase

1. Visit [Supabase](https://supabase.com) to create a new project
2. Copy your project URL and anon key
3. Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_anon_key
```

### 3. Initialize Database

Run the following SQL script in Supabase SQL Editor:
- `docs/migrations/001_complete_schema.sql`

### 4. Start Development Server

```bash
npm run dev
```

Visit http://localhost:5173

## Project Structure

```
flashcard/
├── src/
│   ├── components/         # Shared components
│   ├── features/           # Feature modules
│   │   ├── auth/          # Authentication
│   │   ├── decks/         # Deck management
│   │   ├── cards/         # Card management
│   │   ├── study/         # Study functionality
│   │   ├── profile/       # User profile
│   │   ├── tags/          # Tag system
│   │   ├── search/        # Global search
│   │   └── marketplace/   # Marketplace
│   ├── lib/               # Core libraries
│   │   ├── supabase/      # Supabase client
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   ├── hooks/             # Global hooks
│   ├── contexts/          # React contexts
│   └── pages/             # Page components
└── docs/migrations/        # Database migrations
```

## Core Features

### Spaced Repetition Algorithm (SM-2)

Implements the classic SM-2 algorithm that automatically adjusts review intervals based on memory performance:
- Quality ratings 0-5
- Automatic next review date calculation
- Dynamic difficulty factor adjustment

### User Profiles

- Personal information management
- Study preferences configuration
- Learning statistics tracking
- Account security settings

### Card Marketplace

- Publish personal decks
- Browse community decks
- One-click import for learning
- Payment support (interface reserved)

## Development Commands

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Run tests
npm run test
```

## Contributing

Issues and Pull Requests are welcome!

## License

MIT
