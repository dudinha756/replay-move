# Mood → Movement

Mood → Movement is a personalized wellness web app that turns the user's current emotional and physical context into a short movement suggestion.

## Production architecture

- **Frontend:** React + Vite
- **Hosting/API:** Vercel
- **Authentication:** Neon Auth
- **Database:** Neon Postgres
- **Persistence:** authenticated session and music-profile data
- **Recommendation engine:** transparent rule-based scoring enhanced by each user's outcomes

## Core movement flow

Current mood → energy → desired feeling → environment → preferred intensity → available time → movement recommendation → post-session feedback.

## Music profile

The app does not require Spotify OAuth.

Each user can save:
- favorite artists
- favorite genres
- favorite songs
- favorite eras/decades
- discovery preference: familiar, balanced or discovery-oriented

The app combines this profile with the recommended activity, target mood, intensity and duration to build a personalized suggested playlist. Each item links to a Spotify search page; the app does not read or modify the user's Spotify account.

## Required Vercel environment variables

- `DATABASE_URL`
- `NEON_AUTH_JWKS_URL`
- `VITE_NEON_AUTH_URL`

No Spotify credentials are required.

## API

- `GET /api/health`
- `GET /api/sessions`
- `POST /api/sessions`
- `GET /api/music/profile`
- `PUT /api/music/profile`
- `POST /api/music/playlist`

## Safety

Mood → Movement is a wellness application. It does not diagnose, treat, rehabilitate, or replace individualized medical or professional advice.
