# Strain Project Context

Last updated: 2026-03-09

## Source of truth
- Codebase: `/Users/vinitghelani/racecard`
- Claude session history used for this summary:
  - `/Users/vinitghelani/.claude/history.jsonl`
  - `/Users/vinitghelani/.claude/projects/-Users-vinitghelani/17d38983-851e-4f3a-b405-6fd66491d1ce.jsonl`

## Product vision
Strain is a runner-focused product centered on a shareable "Athlete Passport":
- Verified race history (events, distances, countries, PBs).
- A public profile/passport that acts as social proof and identity.
- Better post-race share content than plain result screenshots.

Longer-term ideas discussed:
- Generate race/result share cards from race links.
- Trendy social story formats for runners.
- Everyday runner utility beyond one-time race result sharing.

## What has been built so far
- Next.js app with auth, dashboard, race flows, and profile/passport UI.
- Parsing and ingest flows for race result links (with provider-specific handling).
- Landing page + login flow + legal pages.
- Public-facing passport view iteration.
- Email/cron-related functionality for race reminders and follow-ups.
- Deployment + domain flow on Vercel (`getstrain.app` / `strain-lyart.vercel.app` context discussed in prior sessions).

## Current product direction
- Keep current visual direction and continue feature expansion.
- Prioritize high-value runner workflows:
  - Passport completeness and trust.
  - Better in-app editing and sharing experiences.
  - Reliable auth and onboarding.
- Add social/distribution features after core passport quality is strong.

## Important context from prior conversations
- User preference: practical, step-by-step shipping over big rewrites.
- User preference: preserve existing app design patterns unless intentionally changing a specific surface.
- Product name is Strain; repo folder started as `racecard`.
- Strava integration has been a recurring strategic area, but can progress without waiting on it.

## Current engineering baseline (Codex verification on 2026-03-09)
- Lint: `0 errors` (`21 warnings` remain).
- Build: passes (`npm run build`) after making email client initialization runtime-safe.
- Branch in progress: `codex-kickoff-workflow`.

## Working agreement for Codex + Claude
- Use one branch per task per tool (`codex-*` / `claude-*`).
- Do not edit the same files concurrently from both tools.
- Keep tasks small and merge frequently.
- Store evolving decisions in repo docs so both tools share the same context.

## Next decisions to lock
- Clear v1 north-star metric (e.g., weekly active runners, shared passports, completed profiles).
- Prioritized feature queue for next 2-3 sprints.
- Data trust policy (what is "verified" vs "self-reported").
