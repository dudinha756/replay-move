# Mood → Movement

Mood → Movement is a focused wellness MVP that turns a user's current context into a short movement suggestion.

## Core flow

**Current mood → energy → desired feeling → environment → preferred intensity → available time → movement recommendation → post-session feedback**

## Progressive personalization

The MVP intentionally uses transparent scoring rules rather than opaque AI.

Each completed session stores:
- current mood
- desired feeling
- energy level
- environment
- intensity preference
- time available
- suggested movement
- post-session result: better, same or worse

When a movement has previously helped the user feel better in a similar context, it receives a higher score in future recommendations. The recommendation screen explains the main reasons behind the choice.

## Current features

- mood and energy check-in
- target emotional state
- environment selection
- intensity preference
- 5, 10, 20 or 30-minute sessions
- transparent recommendation engine
- adaptive history-based scoring
- post-session feedback
- simple progress statistics
- responsive mobile-first interface
- local persistence using versioned localStorage

## Safety

Mood → Movement is a wellness prototype. It does not provide diagnosis, treatment, rehabilitation, emergency guidance or medical advice. Users should stop activity if they feel pain, dizziness or unusual discomfort.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
