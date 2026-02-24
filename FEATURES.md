# ExamPilot V2 — Features Implemented

## F1: Onboarding & Strategy Mode

### Onboarding Flow (7 Screens)

| Step | Screen | Purpose |
|------|--------|---------|
| 0 | Hours | Daily study hours slider (2–10 hrs, 0.5 increments) |
| 1 | Professional | Working professional status (Yes/No) |
| 2 | Attempt | Attempt number (First / Second / Third+) |
| 3 | Approach | Study approach (Thorough / Strategic) |
| 4 | Fallback | Fallback strategy when behind schedule (Push harder / Revise more / Adjust plan) |
| 5 | Result | Displays recommended strategy mode with option to override |
| 6 | Exam Date | Collects name + exam date, submits to API |

### Strategy Mode Classification

Score-based algorithm in `apps/mobile/lib/classify.ts`:

- **Override rule** — working professional with ≤5 hrs/day → `working_professional`
- **Scoring factors** — daily hours, attempt number, study approach, fallback strategy
- **Result** — score ≥ 4 → `aggressive`, score ≤ -1 → `conservative`, else → `balanced`

### 4 Strategy Modes (12 parameters each)

| Mode | Icon | Target User |
|------|------|-------------|
| Balanced | ⚖️ | First-time aspirants, moderate hours |
| Aggressive | 🔥 | 8+ hrs/day, repeat aspirants |
| Conservative | 🎯 | Deep learners, first-time, risk-averse |
| Working Professional | 💼 | Limited hours (≤5/day), job constraints |

**12 tunable parameters per mode:**
revision_frequency, daily_new_topics, pyq_weight, answer_writing_sessions, current_affairs_time, optional_ratio, test_frequency, break_days, deep_study_hours, revision_backlog_limit, csat_time, essay_practice

### Dashboard

- Displays current strategy mode with icon and description
- Reads mode from AsyncStorage for instant load

### Settings Screen

- View and switch between strategy modes (modal picker)
- Advanced settings: 12 individual sliders to fine-tune strategy parameters
- "Redo Onboarding" button to reset and restart the flow

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/onboarding/:userId` | Complete onboarding, create user profile |
| GET | `/api/strategy/:userId` | Get current strategy mode & params |
| POST | `/api/strategy/:userId/switch` | Switch to a different strategy mode |
| POST | `/api/strategy/:userId/customize` | Customize individual strategy parameters |

---

## Architecture & Infrastructure

### Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native (Expo SDK 52), Expo Router v4 |
| Backend | Fastify 5 (Node.js) |
| Database | Supabase (PostgreSQL) |
| Server State | React Query (TanStack Query v5) |
| Local State | AsyncStorage |

### Project Structure

```
cse-study-planner/
├── apps/
│   ├── mobile/           # Expo React Native app
│   │   ├── app/          # File-based routing (Expo Router)
│   │   ├── components/   # Reusable UI (QuestionScreen, OptionCard, ModeCard, etc.)
│   │   ├── lib/          # API client, classification engine, Supabase client
│   │   ├── hooks/        # React Query hooks (useStrategy, useSwitchMode, useCustomizeParams)
│   │   ├── types/        # TypeScript interfaces
│   │   └── constants/    # Theme colors, strategy mode definitions
│   └── api/              # Fastify backend
│       └── src/
│           ├── routes/   # Onboarding & strategy endpoints
│           ├── services/ # Business logic with Supabase queries
│           ├── lib/      # Supabase client
│           └── types/    # API type definitions
└── package.json          # npm workspaces root
```

### Design System

- **Theme:** Dark mode — background `#0F172A`, surface `#1E293B`, accent cyan `#22D3EE`
- **Components:** QuestionScreen, HoursSlider, OptionCard, ModeCard, ProgressDots, StrategyCard

### Key Patterns

- File-based routing with Expo Router v4
- Onboarding state passed between screens via URL search params
- React Query mutations auto-invalidate strategy queries on success
- API service layer has hardcoded fallback defaults when DB is unavailable
- Monorepo with npm workspaces for shared dependency management
