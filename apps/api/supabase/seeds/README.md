# Seed Files

Seed files populate the local Supabase database with reference data after migrations run.

## File Order

Files are loaded alphabetically by name during `supabase db reset`:

| File | Contents | Depends on |
|------|----------|------------|
| `00a_strategy_defaults.sql` | Strategy mode defaults (4 modes × 12 params), badge definitions (15), exam mode config | Tables from migrations |
| `00b_syllabus.sql` | 16 subjects, 69 chapters, 306 topics (GS-I through GS-IV + Essay) | `subjects`, `chapters`, `topics` tables |
| `00c_pyq_data.sql` | Hand-curated PYQ entries + procedural generation + derived stats | `00b_syllabus.sql` (needs topics) |
| `01_test_users.sql` | 4 test user profiles (one per strategy mode) | `user_profiles` table |

## Running Seeds

```bash
# Full reset (migrations + seeds)
npm run db:reset

# Seed only (requires tables to exist)
npm run db:seed
```

## Idempotency

All seed files use `ON CONFLICT DO NOTHING` — safe to run multiple times.

## Test Users

All test users have password: `password123`

| User ID | Email | Mode | Hours/day |
|---------|-------|------|-----------|
| `d0000000-...-000000000001` | test-balanced@exampilot.dev | balanced | 8 |
| `d0000000-...-000000000002` | test-aggressive@exampilot.dev | aggressive | 10 |
| `d0000000-...-000000000003` | test-conservative@exampilot.dev | conservative | 6 |
| `d0000000-...-000000000004` | test-wp@exampilot.dev | working_professional | 3 |

## Adding New Seeds

1. Prefix with `00` for reference data, `01` for test data
2. Always use `ON CONFLICT DO NOTHING` for idempotency
3. Use deterministic UUIDs (e.g., `a1000000-...`) for cross-file references
