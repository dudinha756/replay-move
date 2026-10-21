# Mood → Movement

Mood → Movement is a personalized wellness MVP that turns a user's current emotional and physical context into a short movement suggestion.

## Production architecture

- **Frontend:** React + Vite
- **Hosting/API:** Vercel
- **Authentication:** Neon Auth (Managed Better Auth)
- **Database:** Neon Postgres
- **Persistence:** authenticated session history stored per user
- **Recommendation engine:** transparent rule-based scoring enhanced by each user's historical outcomes

## Flow

Current mood → energy → desired feeling → environment → preferred intensity → available time → movement recommendation → post-session feedback.

## Personalization

Completed sessions store the full recommendation context. A movement gets a higher future score when it previously ended with the user reporting that they felt better in a similar context.

## Required Vercel environment variables

- `DATABASE_URL` — Neon pooled connection string
- `NEON_AUTH_JWKS_URL` — Neon Auth JWKS endpoint
- `VITE_NEON_AUTH_URL` — public Neon Auth base URL

Never commit the database connection string to GitHub.

## API

- `GET /api/health` — database connectivity check
- `GET /api/sessions` — authenticated user's completed sessions
- `POST /api/sessions` — save a completed session

## Safety

Mood → Movement is a wellness application. It does not diagnose, treat, rehabilitate, or replace individualized medical or professional advice.
