# Samba Claude Code Plugins - Strategic Plan

## Overview

Convert Continuous-Claude-v3 into a lightweight Claude Code plugin for Samba TV engineering. Strip infrastructure requirements (Docker, PostgreSQL, Braintrust) while keeping the valuable agents, skills, and hooks.

## Source Repos

| Repo | Purpose | Status |
|------|---------|--------|
| [samba-cowork-plugins](https://github.com/the-sid-dani/samba-cowork-plugins) | Full Cowork marketplace (forked from Anthropic) | Forked, needs customization |
| [samba-claude-code-plugins](https://github.com/the-sid-dani/samba-claude-code-plugins) | Engineering Claude Code plugins | Created, building from CC-v3 |
| [continuous-claude-v3](https://github.com/the-sid-dani/continuous-claude-v3) | Original source (forked from parcadei) | Forked for reference |

---

## What We're Keeping vs Stripping

### STRIP (Infrastructure)

| Component | Why Remove |
|-----------|-----------|
| Docker + PostgreSQL + pgvector | Heavy infra requirement, not needed for plugin |
| Braintrust tracing (4 hooks) | Requires Braintrust account + API key |
| Lean 4 compiler hooks | Proof-specific, not relevant |
| Agentica swarm hooks | Multi-agent infra, too complex for plugin |
| Python heavy deps (torch, sentence-transformers, asyncpg, fastapi) | ML/DB deps not needed |
| `opc/` directory | Setup wizard, Docker config, math scripts |
| `proofs/` directory | Lean 4 proofs, not relevant |
| Math skills (50+ skill dirs) | Domain-specific, not engineering |
| Agentica skills (6 skill dirs) | SDK-specific |
| Session transcripts | Development artifacts |

### KEEP - Agents (19 core, no external deps)

| Agent | Purpose | Model |
|-------|---------|-------|
| architect | Feature planning + API integration design | opus |
| kraken | Implementation via TDD workflow | opus |
| spark | Lightweight fixes and quick tweaks | sonnet |
| sleuth | Bug investigation and root cause analysis | opus |
| scout | Codebase exploration and pattern finding | sonnet |
| arbiter | Unit/integration test execution | opus |
| atlas | E2E/acceptance test execution | opus |
| phoenix | Refactoring and migration planning | opus |
| aegis | Security vulnerability analysis | opus |
| profiler | Performance profiling, race conditions | opus |
| herald | Release prep, changelogs, version bumps | sonnet |
| critic | Feature and implementation code review | sonnet |
| judge | Refactoring and transformation review | sonnet |
| scribe | Documentation, handoffs, summaries | sonnet |
| liaison | Integration and API review | sonnet |
| surveyor | Migration and upgrade review | sonnet |
| plan-reviewer | Reviews plans from architect/phoenix | sonnet |
| onboard | Analyze brownfield codebase | sonnet |
| research-codebase | Document codebase comprehensively | sonnet |

### KEEP - Skills (23 core engineering skills)

| Skill | What It Does |
|-------|-------------|
| build | Workflow orchestrator for feature development |
| fix | Bug investigation and resolution workflow |
| debug | Debug via logs, DB state, git history |
| tdd | Test-driven development workflow |
| test | Unit + integration + E2E testing |
| refactor | Analyze, plan, implement, review, validate |
| commit | Git commits with user approval |
| release | Security audit -> E2E -> changelog -> docs |
| migrate | Research -> analyze -> plan -> implement -> review |
| security | Vulnerability scan -> verification |
| review | Parallel specialized reviews -> synthesis |
| create_handoff | Handoff document for session transfer |
| resume_handoff | Resume work from handoff |
| describe_pr | Generate PR descriptions |
| premortem | Identify failure modes before they occur |
| implement_plan | Execute plans with verification |
| implement_task | Execute single task + create handoff |
| discovery-interview | Transform vague ideas into specs |
| onboard | Analyze brownfield codebase + create ledger |
| dead-code | Find unused functions |
| compound-learnings | Transform learnings into capabilities |
| workflow-router | Route tasks to specialist agents |
| mot | System health check for skills/agents/hooks |

### KEEP - Skills (CLI-enhanced, optional)

| Skill | CLI | Value |
|-------|-----|-------|
| tldr-code | `tldr` | 95% token savings on code analysis |
| tldr-deep | `tldr` | Full 5-layer function analysis |
| tldr-overview | `tldr` | Token-efficient project overview |
| ast-grep-find | `ast-grep` | Structural code search/refactor |
| qlty-check | `qlty` | Universal linter (70+ linters) |
| morph-search | Morph API | 20x faster code search |
| morph-apply | Morph API | Fast file editing |

### KEEP - Hooks (Tier 1: Standalone, zero infra)

| Hook | Event | What It Does |
|------|-------|-------------|
| path-rules | PreToolUse:Read/Edit/Write | Injects relevant SKILL.md based on file path |
| skill-activation-prompt | UserPromptSubmit | Matches prompt keywords to skills |
| auto-handoff-stop | Stop | Blocks at >=85% context, prompts handoff |
| session-start-continuity | SessionStart | Loads handoff ledger into context |
| persist-project-dir | SessionStart | Sets CLAUDE_PROJECT_DIR env var |
| premortem-suggest | UserPromptSubmit | Suggests /premortem for implementation plans |
| import-error-detector | PostToolUse:Bash | Detects ModuleNotFoundError in output |
| session-outcome | Stop | Prompts user to mark handoff outcome |

### KEEP - Hooks (Tier 2: TLDR-dependent, degrade gracefully)

| Hook | Event | What It Does |
|------|-------|-------------|
| tldr-read-enforcer | PreToolUse:Read | Replaces file reads with AST summaries |
| smart-search-router | PreToolUse:Grep | Routes Grep to structural code search |
| post-edit-diagnostics | PostToolUse:Edit/Write | Instant pyright+ruff after Python edits |
| typescript-preflight | PostToolUse:Edit/Write | tsc + qlty on TS files after edit |
| import-validator | PostToolUse:Edit/Write | Verifies Python imports exist |
| impact-refactor | UserPromptSubmit | Auto-runs call graph on refactoring prompts |
| edit-context-inject | PreToolUse:Edit | Injects file structure before edits |
| signature-helper | PreToolUse:Edit | Injects function signatures as context |

### KEEP - Rules (12)

All rules are pure markdown, no dependencies. Keep all 12.

---

## Implementation Phases

### Phase 1: Clean Copy (Day 1)
- [x] Fork repos, clone locally
- [x] Copy agents, skills, hooks, rules to samba-claude-code-plugins
- [x] Remove math skills (50+ dirs): math, math-help, math-router, math-unified, pint-compute, shapely-compute, loogle-search, prove
- [x] Remove agentica skills (7 dirs): agentica-claude-proxy, agentica-infrastructure, agentica-prompts, agentica-sdk, agentica-server, agentica-spawn
- [x] Remove braintrust skills (2 dirs): braintrust-analyze, braintrust-tracing
- [x] Remove Lean/proof-related hooks (compiler-in-the-loop.sh, compiler-in-the-loop-stop.sh)
- [x] Remove Braintrust hooks (braintrust_hooks.py)
- [x] Remove swarm hooks (session-end-cleanup-swarms in dist/)
- [x] Remove infra-dependent hooks: session-register.sh, file-claims.sh, memory-awareness.sh, pre-tool-use-broadcast.sh, post-tool-use-tracker.py, session-symbol-index.sh/.py, hook_launcher.py, run-python.mjs
- [x] Strip DB imports from hooks that have graceful degradation
- [x] **[PREMORTEM]** Remove/rewrite 3 rules that hardcode PostgreSQL/OPC: dynamic-recall.md, cross-terminal-db.md, agent-memory-recall.md
- [x] **[PREMORTEM]** Prune extra agents not in KEEP list (~29): agentica-agent, braintrust-analyst, chronicler, maestro, pathfinder, sentinel, warden, session-analyst, memory-extractor, context-query-agent, debug-agent, review-agent, etc.
- [x] **[PREMORTEM]** Update skill-rules.json to only reference kept skills (currently maps to ~80 that will be deleted)
- [x] **[PREMORTEM]** Make better-sqlite3 optional in handoff-index.ts (dynamic import with try/catch fallback) or replace with flat-file
- [x] **[PREMORTEM]** Delete dist/ directory and rebuild from source after stripping (contains compiled swarm/braintrust/agentica hooks)
- [x] **[PREMORTEM]** Remove .bak and .backup files scattered in skills and hooks
- [x] Create settings.json with only the kept hooks (must exist for hooks to fire)
- [x] Create clean .mcp.json (no disabled servers)
- [ ] Initial commit

### Phase 2: Make It Work Standalone (Day 2)
- [x] Verify all standalone hooks work without CLAUDE_OPC_DIR
- [x] Test skill-activation-prompt with reduced skill set
- [x] Update skill-rules.json to only reference kept skills
- [x] Test agent definitions load correctly
- [x] Verify no broken cross-references between skills
- [x] Create minimal package.json for hooks (strip heavy deps)
- [x] Build and test hooks TypeScript compilation

### Phase 3: Samba Customization (Day 3+)
- [x] Add Samba-specific agent context (tech stack, repos, conventions)
- [x] Create Samba engineering onboarding skill
- [x] Add Samba code review standards to review skill
- [x] Wire up Samba tool stack in .mcp.json (GitHub MCP)
- [x] Create README with setup instructions for Samba engineers

### Phase 4: Distribution
- [ ] Test as Claude Code plugin: `claude plugin install the-sid-dani/samba-claude-code-plugins`
- [x] Create .claude-plugin/plugin.json manifest
- [x] Document which optional CLIs (tldr, ast-grep, qlty) enhance the experience
- [ ] Share with Samba engineering team

---

## File Structure (Target)

```
samba-claude-code-plugins/
├── .claude-plugin/
│   └── plugin.json              # Plugin manifest
├── .claude/
│   ├── agents/                  # 19 agent definitions (.md + .json)
│   ├── skills/                  # ~30 engineering skills
│   │   ├── skill-rules.json     # Skill activation rules
│   │   └── [skill-name]/SKILL.md
│   ├── hooks/                   # ~16 hooks (standalone + TLDR-enhanced)
│   │   ├── src/                 # TypeScript source
│   │   ├── dist/                # Compiled JS
│   │   ├── package.json         # Minimal deps
│   │   └── tsconfig.json
│   ├── rules/                   # 12 rule files
│   └── settings.json            # Hook registrations
├── README.md
└── PLAN.md                      # This file
```

---

## Risk Mitigations (Pre-Mortem)

**Run:** 2026-03-05 | **Mode:** Deep | **Tigers:** 4 | **Elephants:** 3

### Tigers Addressed:

1. **3 rules hardcode PostgreSQL/OPC infrastructure** (HIGH)
   - Rules: `dynamic-recall.md`, `cross-terminal-db.md`, `agent-memory-recall.md`
   - Mitigation: Remove all 3 in Phase 1. These reference `$CLAUDE_OPC_DIR`, Docker, and PostgreSQL — none of which exist in the plugin.
   - Added to: Phase 1

2. **84 extra skills not pruned — skill-rules.json will reference nonexistent skills** (HIGH)
   - 114 skill dirs exist, plan keeps ~30. skill-rules.json maps keywords to all of them.
   - Mitigation: Prune skill-rules.json in lockstep with skill directory removal in Phase 1.
   - Added to: Phase 1

3. **No settings.json — hooks won't fire** (HIGH)
   - Hooks exist on disk but aren't registered anywhere.
   - Mitigation: Create settings.json as part of Phase 1 (was already listed but emphasized).
   - Added to: Phase 1

4. **better-sqlite3 requires native compilation (node-gyp)** (HIGH)
   - Only used by `handoff-index.ts`. Will fail on machines without C++ build tools.
   - Mitigation: Make import optional with try/catch fallback, or replace with flat-file storage.
   - Added to: Phase 1

### Elephants Noted:

1. **29 extra agents not in KEEP list** (MEDIUM) — Added pruning step to Phase 1
2. **dist/ contains compiled hooks for stripped features** (MEDIUM) — Added clean rebuild to Phase 1
3. **Plugin manifest format (.claude-plugin/plugin.json) undocumented** (MEDIUM) — Test early in Phase 4, don't wait until distribution

### Accepted Risks:

- TLDR-dependent hooks (Tier 2) will fail without `tldr` CLI — acceptable, they degrade gracefully
- Mixed hook languages (.sh, .py, .ts) — inherited complexity, works as-is
