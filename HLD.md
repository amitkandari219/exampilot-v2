# ExamPilot V2 — High-Level Design (HLD)

## 1. Overview

ExamPilot V2 is a UPSC CSE exam preparation platform that combines intelligent study planning, spaced repetition, burnout prevention, and gamification. It helps aspirants optimize their preparation through personalized strategy modes, adaptive daily plans, and real-time performance analytics.

## 2. System Architecture

```
┌───────────────────────────────────────────────────────────┐
│                     Mobile Client                         │
│              (React Native / Expo SDK 54)                 │
│                                                           │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│   │Dashboard │  │ Syllabus │  │ Planner  │  │Settings │ │
│   │   Tab    │  │   Tab    │  │   Tab    │  │  Tab    │ │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│        │              │              │              │      │
│   ┌────┴──────────────┴──────────────┴──────────────┴──┐  │
│   │           React Query (TanStack Query v5)          │  │
│   │         Server State + Cache + Mutations           │  │
│   └────────────────────┬───────────────────────────────┘  │
│                        │                                  │
│   ┌────────────────────┴───────────────────────────────┐  │
│   │              API Client (lib/api.ts)               │  │
│   │         Bearer Token auto-injection                │  │
│   └────────────────────┬───────────────────────────────┘  │
│                        │                                  │
│   ┌────────────────────┴───────────────────────────────┐  │
│   │         Supabase Client (lib/supabase.ts)          │  │
│   │      Auth sessions + Direct DB (fallback)          │  │
│   └────────────────────┬───────────────────────────────┘  │
└────────────────────────┼──────────────────────────────────┘
                         │ HTTPS / JWT
                         ▼
┌────────────────────────────────────────────────────────────┐
│                    API Server (Fastify 5)                   │
│                                                            │
│   ┌──────────────┐   ┌────────────────────────────────┐   │
│   │Auth Middleware│──▶│    18 Route Modules             │   │
│   │Bearer → userId│   │  onboarding, strategy, profile │   │
│   └──────────────┘   │  pyq, syllabus, fsrs, velocity │   │
│                       │  burnout, stress, planner      │   │
│                       │  weakness, recalibration       │   │
│                       │  weeklyReview, gamification    │   │
│                       │  benchmark, mockTest           │   │
│                       │  simulator, currentAffairs     │   │
│                       └───────────┬────────────────────┘   │
│                                   │                        │
│   ┌───────────────────────────────┴────────────────────┐   │
│   │            18 Service Modules                      │   │
│   │    Business logic, algorithms, DB queries          │   │
│   └───────────────────────┬────────────────────────────┘   │
└───────────────────────────┼────────────────────────────────┘
                            │ SQL
                            ▼
┌────────────────────────────────────────────────────────────┐
│                  Supabase (PostgreSQL)                      │
│                                                            │
│   ┌──────────┐  ┌──────────┐  ┌──────────────────────┐   │
│   │   Auth   │  │ Storage  │  │     Database          │   │
│   │  (JWT)   │  │(Avatars) │  │  21 migrations        │   │
│   │          │  │          │  │  30+ tables            │   │
│   └──────────┘  └──────────┘  └──────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

## 3. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Mobile | Expo (React Native) | SDK 54 / RN 0.81 |
| UI Framework | React | 19.1 |
| Navigation | Expo Router | v4 (file-based) |
| Server State | TanStack React Query | 5.50 |
| Backend | Fastify | 5.x |
| Database | PostgreSQL (Supabase) | 15 |
| Auth | Supabase Auth | JWT Bearer |
| Storage | Supabase Storage | Avatars bucket |
| Spaced Repetition | ts-fsrs | 5.2 |
| Language | TypeScript | 5.9 |

## 4. Feature Map (18 Features)

| # | Feature | Description | Status |
|---|---------|-------------|--------|
| F1 | Onboarding & Strategy | Conversational onboarding, 4 strategy modes, personalized targets | Complete |
| F2 | PYQ Intelligence | Previous year question gravity weighting, trending topics | Complete |
| F3 | Living Syllabus Map | Full GS1-GS4 tree with progress tracking, status management | Complete |
| F4 | Velocity Engine + Buffer Bank | Study pace tracking, surplus/deficit banking, streaks | Complete |
| F5 | Confidence Decay (FSRS) | Spaced repetition confidence scoring, retrievability | Complete |
| F6 | Revision Scheduler | Due revisions, auto-scheduling, confidence overview | Complete |
| F7 | Stress Thermometer | 4-signal composite stress score with recommendations | Complete |
| F8 | Smart Daily Planner | Priority-scored daily plans, greedy fill algorithm | Complete |
| F9 | Weakness Radar | Multi-factor health scoring per topic, weakest areas | Complete |
| F10 | Auto-Recalibration | Adaptive persona parameter adjustment every 3+ days | Complete |
| F11 | Weekly Review | Auto-generated weekly summaries with grade & insights | Complete |
| F12 | Gamification | XP system, 15 badges, leveling, milestone rewards | Complete |
| F13 | Mock Test Tracker | Score logging, subject accuracy, topic-level trends | Complete |
| F14 | Benchmark Readiness | Composite readiness score (5 dimensions) | Complete |
| F15 | What-If Simulator | Scenario testing (extra hours, skip days, mode switch) | Complete |
| F16 | Current Affairs | Daily CA logging, streaks, subject gap analysis | Complete |
| F17 | Edit Profile | Name, exam date, avatar management in settings | Complete |
| F18 | Light/Dark Theme | Dual theme with persistence | Complete |

## 5. User Flow

```
App Launch
    │
    ▼
┌─────────┐    No Session    ┌──────────┐
│  Index   │────────────────▶│  Login/  │
│(Redirect)│                 │  Signup  │
└────┬─────┘                 └────┬─────┘
     │ Has Session                │ Auth Success
     ▼                            ▼
┌──────────────┐          ┌──────────────┐
│  Onboarding  │◀─────────│ Check Profile│
│  Completed?  │  No      │              │
└──────┬───────┘          └──────────────┘
       │ Yes
       ▼
┌──────────────────────────────────────┐
│           5-Tab Main App             │
│                                      │
│  Dashboard │ Syllabus │ Planner │    │
│  Progress  │ Settings               │
└──────────────────────────────────────┘
```

### Onboarding Flow (10 Steps)
```
Name → Target Year → Attempt # → User Type → Challenges
  → Value Prop → Strategy + Exam Date → Targets → Promise → Complete
```

## 6. Data Flow Pattern

```
┌──────────┐  useQuery()  ┌──────────┐  fetch()  ┌──────────┐  SQL  ┌────────┐
│  Screen  │─────────────▶│  Hook    │──────────▶│  API     │──────▶│  DB    │
│Component │              │(RQ Cache)│           │ Service  │       │Supabase│
│          │◀─────────────│          │◀──────────│          │◀──────│        │
└──────────┘   re-render  └──────────┘   JSON    └──────────┘  rows └────────┘

Mutations:
Screen → useMutation() → api.method() → API Route → Service → DB
                       → onSuccess: invalidateQueries → refetch
```

## 7. Authentication Flow

```
Mobile App                    Supabase Auth                API Server
    │                              │                          │
    │  signIn(email, password)     │                          │
    │─────────────────────────────▶│                          │
    │      JWT access_token        │                          │
    │◀─────────────────────────────│                          │
    │                              │                          │
    │  API request + Bearer token  │                          │
    │─────────────────────────────────────────────────────────▶│
    │                              │  auth.getUser(token)     │
    │                              │◀─────────────────────────│
    │                              │  { user.id }             │
    │                              │─────────────────────────▶│
    │                              │                   request.userId = user.id
    │          JSON response       │                          │
    │◀─────────────────────────────────────────────────────────│
```

## 8. Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Monorepo | npm workspaces | Shared types, single install, coordinated versions |
| No userId in URLs | Auth middleware injects | Security — prevents IDOR attacks |
| Append-only audit tables | persona_snapshots, etc. | Full history for recalibration, debugging |
| React Query over Redux | Server state pattern | Auto-caching, background refetch, mutation invalidation |
| Supabase direct reads (mobile) | Fallback for API failures | Settings screen works even if API isn't deployed |
| FSRS library (ts-fsrs) | Proven spaced repetition | Better than custom implementation, configurable retention |
| File-based routing | Expo Router v4 | Convention over configuration, deep linking |
| AsyncStorage for prefill | Cross-navigation data | Survives full page reloads on web |

## 9. Deployment Topology

```
Development:
  Mobile: Expo Dev Server (localhost:8081) → Expo Go on device
  API: Fastify (0.0.0.0:3001)
  DB: Supabase local (localhost:54321)

Production (planned):
  Mobile: EAS Build → App Store / Play Store
  API: Cloud (e.g., Railway, Fly.io)
  DB: Supabase Cloud (managed PostgreSQL)
  Storage: Supabase Storage (avatars bucket)
```

## 10. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Offline support | AsyncStorage for theme, auth session persistence |
| Responsiveness | React Query stale-while-revalidate pattern |
| Security | JWT auth, no userId in URLs, RLS on Supabase |
| Theming | Dark (default) + Light mode, persisted preference |
| Cross-platform | iOS, Android, Web (Expo universal) |
