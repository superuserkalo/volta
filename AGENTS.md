<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Workflow (owner's standing instruction)

- **Always commit, push, and deploy continuously.** After every meaningful, working change: commit to `main`, `git push origin main`, and deploy to Vercel. Don't ask first and don't batch it up for later.
- Work directly on `main`. No feature branches, worktrees, or process overhead.
- Before each commit, run `pnpm test`, `pnpm lint`, and `pnpm build` (and `pnpm e2e` for UI changes). Only commit, push, and deploy when they pass.
- Copy rule: every visible string comes verbatim from volta.coffee (`docs/research/volta-site/copy-verbatim.txt`), guarded by `src/content/copy.test.ts`. Allowed exceptions live in `src/content/allowed-edits.ts`.
- Design and plan: `docs/superpowers/specs/` and `docs/superpowers/plans/`.
