# Codex + Claude Workflow

## Branching rules
- Keep `main` stable.
- Create one branch per task:
  - `codex/<task>` when Codex is implementing.
  - `claude/<task>` when Claude is implementing.
- Do not run both agents on the same branch.

## Daily loop
1. Pick one task from backlog.
2. Ask one agent to implement on its own branch.
3. Run checks:
   - `npm run lint`
   - `npm run build`
4. Commit with a focused message.
5. Merge to `main` only after checks pass.

## Handoff between agents
- Share scope explicitly: files to touch and files to avoid.
- If task overlaps existing in-flight work, rebase before editing.
- Prefer small PRs to reduce merge conflicts.

## Suggested ownership split
- Codex: implementation, refactors, test/code fixes.
- Claude: architecture options, UX copy, requirement shaping.

## First cleanup target
Current lint baseline has 9 errors and 21 warnings. Fix lint errors first, then build new features.
