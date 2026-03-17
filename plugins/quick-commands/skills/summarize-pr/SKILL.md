---
description: Summarize the current PR or recent git changes
disable-model-invocation: true
---

Summarize the current pull request or recent git changes:

1. Run `git diff main...HEAD` (or the appropriate base branch) to see all changes
2. Group changes by file or feature area
3. Produce a summary with:
   - **One-liner**: What this PR does in one sentence
   - **Changes**: Bullet list of what changed, grouped logically
   - **Impact**: What parts of the system are affected
   - **Risk**: Low/Medium/High with brief justification

Keep it concise — this should be scannable in 30 seconds.
