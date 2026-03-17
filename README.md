# Samba Plugins

A Claude Code plugin marketplace for Samba TV. Install the plugins you need — engineering workflows, productivity tools, and more.

## Quick Start

```bash
# Add the marketplace
/plugin marketplace add the-sid-dani/samba-claude-code-plugins

# Browse available plugins
/plugin

# Install what you need
/plugin install samba-engineering@samba-plugins
/plugin install quick-commands@samba-plugins
```

## Available Plugins

| Plugin | Description |
|--------|-------------|
| **samba-engineering** | Engineering-grade agents, skills, and hooks — TDD, code review, debugging, security, release management |
| **quick-commands** | Handy slash commands — `/quick-commands:explain-code`, `/quick-commands:summarize-pr` |

## Adding New Plugins

1. Create a directory under `plugins/your-plugin-name/`
2. Add `.claude-plugin/plugin.json` manifest
3. Add your skills, commands, agents, hooks, or rules
4. Register in `.claude-plugin/marketplace.json`

See [Plugin docs](https://code.claude.com/docs/en/plugins) for details.

## Structure

```
.claude-plugin/
  marketplace.json          # Marketplace catalog
plugins/
  samba-engineering/         # Engineering workflows
  quick-commands/            # Everyday dev commands
  your-next-plugin/          # Add more here
```
