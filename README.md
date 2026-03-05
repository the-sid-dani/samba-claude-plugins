# Samba Claude Code Plugins

Engineering-grade Claude Code plugins for Samba TV. Provides 19 specialized agents, 31 skills, and 16 hooks that make Claude Code significantly more effective for software development.

## Quick Start

```bash
# Clone the repo
git clone https://github.com/the-sid-dani/samba-claude-code-plugins.git

# Install hook dependencies (one-time)
cd samba-claude-code-plugins/.claude/hooks
npm install && npm run build
```

Then open any project with Claude Code — the plugins activate automatically when this repo is configured as a plugin source.

## What's Included

### Agents (19)

Specialized sub-agents that Claude spawns for specific tasks:

| Agent | Purpose | Model |
|-------|---------|-------|
| **architect** | Feature planning + API design | opus |
| **kraken** | Implementation via TDD | opus |
| **spark** | Quick fixes and tweaks | sonnet |
| **sleuth** | Bug investigation + root cause | opus |
| **scout** | Codebase exploration | sonnet |
| **arbiter** | Unit/integration tests | opus |
| **atlas** | E2E/acceptance tests | opus |
| **phoenix** | Refactoring + migration planning | opus |
| **aegis** | Security vulnerability analysis | opus |
| **profiler** | Performance profiling | opus |
| **herald** | Release prep + changelogs | sonnet |
| **critic** | Code review (features) | sonnet |
| **judge** | Code review (refactoring) | sonnet |
| **scribe** | Documentation + handoffs | sonnet |
| **liaison** | Integration/API review | sonnet |
| **surveyor** | Migration/upgrade review | sonnet |
| **plan-reviewer** | Plan quality review | sonnet |
| **onboard** | Codebase analysis | sonnet |
| **research-codebase** | Documentation generation | sonnet |

### Skills (31)

Workflow orchestrators invoked via `/skill-name`:

| Skill | What It Does |
|-------|-------------|
| `/build` | Feature development workflow |
| `/fix` | Bug investigation + resolution |
| `/debug` | Debug via logs, DB state, git |
| `/tdd` | Test-driven development |
| `/test` | Unit + integration + E2E |
| `/refactor` | Analyze → plan → implement → validate |
| `/commit` | Git commits with user approval |
| `/release` | Security audit → E2E → changelog |
| `/migrate` | Research → analyze → plan → implement |
| `/security` | Vulnerability scan → verification |
| `/review` | Parallel code reviews → synthesis |
| `/create_handoff` | Session transfer documents |
| `/resume_handoff` | Resume from handoff |
| `/describe_pr` | Generate PR descriptions |
| `/premortem` | Identify failure modes |
| `/implement_plan` | Execute plans with verification |
| `/implement_task` | Single task + handoff |
| `/discovery-interview` | Vague ideas → detailed specs |
| `/onboard` | Analyze brownfield codebase |
| `/samba-onboard` | Samba-specific project onboarding |
| `/dead-code` | Find unused functions |
| `/compound-learnings` | Transform learnings into capabilities |
| `/workflow-router` | Route tasks to specialists |
| `/mot` | System health check |

**CLI-enhanced (optional):**

| Skill | CLI Required | Value |
|-------|-------------|-------|
| `/tldr-code` | `tldr` | 95% token savings on code analysis |
| `/tldr-deep` | `tldr` | Full 5-layer function analysis |
| `/tldr-overview` | `tldr` | Token-efficient project overview |
| `/ast-grep-find` | `ast-grep` | Structural code search |
| `/qlty-check` | `qlty` | Universal linter (70+ linters) |
| `/morph-search` | Morph API | 20x faster code search |
| `/morph-apply` | Morph API | Fast file editing |

### Hooks (16)

Automatic behaviors that fire on Claude Code events:

**Always active (Tier 1):**
- **path-rules** — Injects relevant skill context based on file paths
- **skill-activation-prompt** — Matches prompts to skills automatically
- **auto-handoff-stop** — Blocks at 85%+ context, prompts handoff
- **session-start-continuity** — Loads handoff ledger on resume/compact
- **persist-project-dir** — Makes project dir available to all bash commands
- **premortem-suggest** — Suggests /premortem for implementation plans
- **import-error-detector** — Detects ModuleNotFoundError in bash output
- **session-outcome** — Prompts outcome marking on session end

**TLDR-enhanced (Tier 2, degrade gracefully without `tldr`):**
- **tldr-read-enforcer** — Replaces file reads with AST summaries (95% token savings)
- **smart-search-router** — Routes Grep to structural code search
- **post-edit-diagnostics** — Instant pyright+ruff after Python edits
- **typescript-preflight** — tsc + qlty on TS files after edit
- **import-validator** — Verifies Python imports exist after edit
- **impact-refactor** — Auto-runs call graph on refactoring prompts
- **edit-context-inject** — Injects file structure before edits
- **signature-helper** — Injects function signatures as context

### Rules (8)

Pure markdown guidelines that shape Claude's behavior:
- Samba engineering standards (tech stack, git conventions, AI tools)
- Agent model selection (when to use Opus vs Sonnet)
- Claim verification (verify before asserting)
- Destructive command safety
- Proactive agent delegation
- TLDR CLI usage patterns
- Scout vs Explore preference

## Optional CLI Tools

These CLIs unlock Tier 2 hooks and enhanced skills:

| Tool | Install | What It Enables |
|------|---------|----------------|
| [tldr](https://github.com/parcadei/tldr-cli) | `pip install tldr-cli` | 95% token savings, code flow analysis |
| [ast-grep](https://ast-grep.github.io/) | `brew install ast-grep` | Structural code search/refactor |
| [qlty](https://qlty.sh/) | `brew install qlty` | Universal linting (70+ linters) |

Without these, Tier 2 hooks simply pass through — no errors, no degradation.

## Project Structure

```
samba-claude-code-plugins/
├── .claude/
│   ├── agents/        # 19 agent definitions (.md + .json)
│   ├── skills/        # 31 skills (SKILL.md per directory)
│   │   └── skill-rules.json  # Activation triggers
│   ├── hooks/         # 16 hooks
│   │   ├── src/       # TypeScript source
│   │   ├── dist/      # Compiled JS (pre-built)
│   │   └── package.json
│   ├── rules/         # 8 rule files
│   └── settings.json  # Hook registrations
├── .mcp.json          # MCP server config
├── PLAN.md            # Implementation plan
└── README.md          # This file
```

## Origin

Derived from [continuous-claude-v3](https://github.com/parcadei/continuous-claude-v3), stripped of infrastructure dependencies (Docker, PostgreSQL, Braintrust) and customized for Samba TV engineering.
