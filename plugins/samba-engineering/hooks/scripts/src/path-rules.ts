/**
 * Path-based rule injection hook
 *
 * Fires on PreToolUse for Read/Edit/Write
 * Matches file paths against patterns and injects relevant skill content
 */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface HookInput {
  session_id: string;
  hook_event_name: string;
  tool_name: string;
  tool_input: {
    file_path?: string;
  };
}

interface PathRule {
  pattern: RegExp;
  skillName: string;
  description: string;
}

// Path patterns → skill mappings
// Only references skills that exist in this plugin
const PATH_RULES: PathRule[] = [
  // Hook development
  { pattern: /\.claude\/hooks\//, skillName: 'build', description: 'Hook development' },

  // Skill development
  { pattern: /\.claude\/skills\//, skillName: 'workflow-router', description: 'Skill routing' },

  // Continuity ledgers
  { pattern: /thoughts\/ledgers\/CONTINUITY_CLAUDE-/, skillName: 'create_handoff', description: 'Handoff management' },

  // Test files
  { pattern: /\.(test|spec)\.(ts|tsx|js|jsx)$/, skillName: 'tdd', description: 'Test-driven development' },

  // Security-sensitive files
  { pattern: /\.(env|secret|key|pem|cert)/, skillName: 'security', description: 'Security review' },
];

function readStdin(): string {
  return readFileSync(0, 'utf-8');
}

function getProjectDir(): string {
  return process.env.CLAUDE_PROJECT_DIR || process.cwd();
}

function loadSkillContent(skillName: string): string | null {
  // Try plugin root first, then project .claude/skills/
  const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || '';
  const projectDir = getProjectDir();
  const pluginSkillPath = pluginRoot ? join(pluginRoot, 'skills', skillName, 'SKILL.md') : '';
  const projectSkillPath = join(projectDir, '.claude', 'skills', skillName, 'SKILL.md');
  const skillPath = (pluginSkillPath && existsSync(pluginSkillPath)) ? pluginSkillPath : projectSkillPath;

  if (!existsSync(skillPath)) return null;

  try {
    let content = readFileSync(skillPath, 'utf-8');
    // Strip frontmatter
    if (content.startsWith('---')) {
      const end = content.indexOf('---', 3);
      if (end !== -1) content = content.slice(end + 3).trim();
    }
    return content;
  } catch {
    return null;
  }
}

function getMatchingSkills(filePath: string): string[] {
  const matched: string[] = [];
  for (const rule of PATH_RULES) {
    if (rule.pattern.test(filePath)) {
      matched.push(rule.skillName);
    }
  }
  return matched;
}

async function main() {
  const input: HookInput = JSON.parse(readStdin());
  const filePath = input.tool_input?.file_path;

  if (!filePath) {
    console.log('{}');
    return;
  }

  const skills = getMatchingSkills(filePath);
  if (skills.length === 0) {
    console.log('{}');
    return;
  }

  const contents: string[] = [];
  for (const skill of skills) {
    const content = loadSkillContent(skill);
    if (content) contents.push(content);
  }

  if (contents.length === 0) {
    console.log('{}');
    return;
  }

  console.log(JSON.stringify({
    continue: true,
    systemMessage: contents.join('\n\n---\n\n')
  }));
}

main().catch(() => process.exit(1));
