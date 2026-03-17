# Samba TV Engineering Standards

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python (FastAPI, Django), Go |
| Frontend | React, TypeScript, Next.js |
| Data | Spark, Airflow, Snowflake, BigQuery |
| Infrastructure | AWS (EKS, EC2, S3, Lambda), Terraform |
| CI/CD | GitHub Actions, ArgoCD |
| Observability | Datadog, PagerDuty |
| Auth | Okta SSO |
| Communication | Slack, Jira, Confluence |

## Code Standards

- Python: Follow PEP 8, use type hints, docstrings for public APIs
- TypeScript: Strict mode, prefer interfaces over types for public contracts
- All PRs require at least 1 reviewer approval
- Tests required for new features and bug fixes
- No secrets in code — use AWS Secrets Manager or environment variables

## Git Conventions

- Branch naming: `feature/JIRA-123-short-description`, `fix/JIRA-456-bug-name`
- Commit messages: Reference Jira ticket (e.g., `[JIRA-123] Add validation for...`)
- Squash merge to main
- Delete branches after merge

## AI Tools at Samba

- Claude is available GA via Okta at claude.ai
- AI Slackbot: @samba in Slack
- Support channel: #ai-enablement
