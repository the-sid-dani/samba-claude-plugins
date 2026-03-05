---
name: samba-onboard
description: Samba TV engineering onboarding - project setup, standards, and tooling
user-invocable: true
---

# Samba Onboard - Engineering Setup

Get a new Samba TV engineer (or AI agent) oriented in a project.

## When to Use

- "onboard me to this Samba project"
- "set up my dev environment"
- "what's the Samba way to do X"
- First time in a Samba repo

## Process

### 1. Project Discovery

Run the general `/onboard` skill first to analyze the codebase structure.

### 2. Samba-Specific Checks

After general onboarding, verify Samba conventions:

```bash
# Check for standard Samba project files
echo "=== Samba Project Checks ==="

# CI/CD
[ -d ".github/workflows" ] && echo "PASS: GitHub Actions configured" || echo "WARN: No GitHub Actions"

# Infrastructure
[ -d "terraform" ] || [ -d "infra" ] && echo "PASS: IaC found" || echo "INFO: No Terraform/infra dir"

# Docker
[ -f "Dockerfile" ] || [ -f "docker-compose.yml" ] && echo "PASS: Docker configured" || echo "INFO: No Docker"

# Python project
[ -f "pyproject.toml" ] || [ -f "requirements.txt" ] && echo "PASS: Python project" || echo "INFO: Not a Python project"

# Node project
[ -f "package.json" ] && echo "PASS: Node project" || echo "INFO: Not a Node project"

# Linting
[ -f ".pre-commit-config.yaml" ] && echo "PASS: Pre-commit hooks" || echo "WARN: No pre-commit hooks"
```

### 3. Samba Standards Briefing

After analysis, share key Samba engineering standards:

- **Git**: Branch from main, use `feature/JIRA-XXX-description` naming
- **PRs**: Require 1+ reviewer, squash merge, link Jira ticket
- **Testing**: Required for new features and fixes
- **Secrets**: Never in code — use AWS Secrets Manager
- **Observability**: Datadog for metrics/logs, PagerDuty for alerts
- **AI Tools**: Claude via Okta, @samba Slackbot, #ai-enablement for help

### 4. Recommend Next Steps

Based on the project type, suggest:
- Setting up local dev environment
- Running existing tests
- Reviewing recent PRs for coding patterns
- Checking Jira board for current sprint work
