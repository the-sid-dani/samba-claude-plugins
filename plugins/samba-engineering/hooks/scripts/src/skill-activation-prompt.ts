#!/usr/bin/env node
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Import shared resource reader (Phase 4 module)
import { readResourceState, ResourceState } from './shared/resource-reader.js';

// Import validation module for false-positive reduction
import {
    shouldValidateWithLLM,
    buildValidationPrompt,
    SkillMatch,
} from './skill-validation-prompt.js';

interface HookInput {
    session_id: string;
    transcript_path: string;
    cwd: string;
    permission_mode: string;
    prompt: string;
}


interface PromptTriggers {
    keywords?: string[];
    intentPatterns?: string[];
}

interface SkillRule {
    type: 'guardrail' | 'domain';
    enforcement: 'block' | 'suggest' | 'warn';
    priority: 'critical' | 'high' | 'medium' | 'low';
    promptTriggers?: PromptTriggers;
    description?: string;
}

interface SkillRules {
    version: string;
    skills: Record<string, SkillRule>;
    agents?: Record<string, SkillRule>;
}

interface MatchedSkill {
    name: string;
    matchType: 'keyword' | 'intent';
    matchedTerm?: string;
    config: SkillRule;
    isAgent?: boolean;
    needsValidation?: boolean;
}


/**
 * Detect semantic/natural language queries that would benefit from TLDR semantic search.
 * Pattern: Questions starting with how/what/where/why/when/which
 */
function detectSemanticQuery(prompt: string): { isSemanticQuery: boolean; suggestion?: string } {
    // Question word patterns that indicate semantic queries
    const semanticPatterns = [
        /^(how|what|where|why|when|which)\s/i,
        /\?$/,
        /^(find|show|list|get|explain)\s+(all|the|every|any)/i,
        /^.*\s+(implementation|architecture|flow|pattern|logic|system)$/i,
    ];

    const isSemanticQuery = semanticPatterns.some(p => p.test(prompt.trim()));

    if (!isSemanticQuery) {
        return { isSemanticQuery: false };
    }

    // Generate suggestion for semantic search
    const shortPrompt = prompt.length > 50 ? prompt.slice(0, 50) + '...' : prompt;
    const suggestion = `💡 **Semantic Query Detected**

Your question "${shortPrompt}" may benefit from semantic code search.

**Try:**
\`\`\`bash
tldr semantic search "${prompt.slice(0, 100)}" .
\`\`\`

Or use the /explore skill for guided exploration.
`;

    return { isSemanticQuery: true, suggestion };
}

async function main() {
    try {
        // Read input from stdin
        const input = readFileSync(0, 'utf-8');
        let data: HookInput;
        try {
            data = JSON.parse(input);
        } catch {
            // Malformed JSON - exit silently
            process.exit(0);
        }

        // Early validation - prompt is required
        if (!data.prompt || typeof data.prompt !== 'string') {
            process.exit(0);
        }
        const prompt = data.prompt.toLowerCase();

        // Load skill rules (try plugin root first, then project, then global)
        const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || '';
        const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
        const homeDir = process.env.HOME || process.env.USERPROFILE || '';
        const pluginRulesPath = pluginRoot ? join(pluginRoot, 'skills', 'skill-rules.json') : '';
        const projectRulesPath = join(projectDir, '.claude', 'skills', 'skill-rules.json');
        const globalRulesPath = join(homeDir, '.claude', 'skills', 'skill-rules.json');

        let rulesPath = '';
        if (pluginRulesPath && existsSync(pluginRulesPath)) {
            rulesPath = pluginRulesPath;
        } else if (existsSync(projectRulesPath)) {
            rulesPath = projectRulesPath;
        } else if (existsSync(globalRulesPath)) {
            rulesPath = globalRulesPath;
        } else {
            // No rules file found, exit silently
            process.exit(0);
        }
        const rules: SkillRules = JSON.parse(readFileSync(rulesPath, 'utf-8'));


        // CHANGE 3: Detect semantic queries and suggest TLDR semantic search
        const semanticQuery = detectSemanticQuery(data.prompt);

        const matchedSkills: MatchedSkill[] = [];

        // Check each skill for matches
        for (const [skillName, config] of Object.entries(rules.skills)) {
            const triggers = config.promptTriggers;
            if (!triggers) {
                continue;
            }

            // Keyword matching
            if (triggers.keywords) {
                const matchedKeyword = triggers.keywords.find(kw =>
                    prompt.includes(kw.toLowerCase())
                );
                if (matchedKeyword) {
                    // Check if this match needs LLM validation
                    const skillMatchForValidation: SkillMatch = {
                        skillName,
                        matchType: 'keyword',
                        matchedTerm: matchedKeyword,
                        prompt: data.prompt, // Use original prompt (not lowercased)
                        skillDescription: config.description,
                        enforcement: config.enforcement,
                    };
                    const needsValidation = shouldValidateWithLLM(skillMatchForValidation);

                    matchedSkills.push({
                        name: skillName,
                        matchType: 'keyword',
                        matchedTerm: matchedKeyword,
                        config,
                        needsValidation,
                    });
                    continue;
                }
            }

            // Intent pattern matching (no validation needed - strong signal)
            if (triggers.intentPatterns) {
                const intentMatch = triggers.intentPatterns.some(pattern => {
                    try {
                        const regex = new RegExp(pattern, 'i');
                        return regex.test(prompt);
                    } catch {
                        // Invalid regex pattern, skip
                        return false;
                    }
                });
                if (intentMatch) {
                    matchedSkills.push({
                        name: skillName,
                        matchType: 'intent',
                        config,
                        needsValidation: false,
                    });
                }
            }
        }

        // Check each agent for matches
        const matchedAgents: MatchedSkill[] = [];
        if (rules.agents) {
            for (const [agentName, config] of Object.entries(rules.agents)) {
                const triggers = config.promptTriggers;
                if (!triggers) {
                    continue;
                }

                // Keyword matching
                if (triggers.keywords) {
                    const matchedKeyword = triggers.keywords.find(kw =>
                        prompt.includes(kw.toLowerCase())
                    );
                    if (matchedKeyword) {
                        // Check if this match needs LLM validation
                        const skillMatchForValidation: SkillMatch = {
                            skillName: agentName,
                            matchType: 'keyword',
                            matchedTerm: matchedKeyword,
                            prompt: data.prompt,
                            skillDescription: config.description,
                            enforcement: config.enforcement,
                        };
                        const needsValidation = shouldValidateWithLLM(skillMatchForValidation);

                        matchedAgents.push({
                            name: agentName,
                            matchType: 'keyword',
                            matchedTerm: matchedKeyword,
                            config,
                            isAgent: true,
                            needsValidation,
                        });
                        continue;
                    }
                }

                // Intent pattern matching (no validation needed - strong signal)
                if (triggers.intentPatterns) {
                    const intentMatch = triggers.intentPatterns.some(pattern => {
                        try {
                            const regex = new RegExp(pattern, 'i');
                            return regex.test(prompt);
                        } catch {
                            // Invalid regex pattern, skip
                            return false;
                        }
                    });
                    if (intentMatch) {
                        matchedAgents.push({
                            name: agentName,
                            matchType: 'intent',
                            config,
                            isAgent: true,
                            needsValidation: false,
                        });
                    }
                }
            }
        }

        // Generate output if matches found OR pattern inference succeeded OR semantic query detected
        if (matchedSkills.length > 0 || matchedAgents.length > 0 || semanticQuery.isSemanticQuery) {
            // Check which skills need LLM validation (potential false positives)
            const skillsNeedingValidation = matchedSkills.filter(s => s.needsValidation);
            const agentsNeedingValidation = matchedAgents.filter(a => a.needsValidation);
            const allNeedingValidation = [...skillsNeedingValidation, ...agentsNeedingValidation];

            // Filter out skills that need validation from the main lists
            // (they will be shown in a separate section)
            const confirmedSkills = matchedSkills.filter(s => !s.needsValidation);
            const confirmedAgents = matchedAgents.filter(a => !a.needsValidation);

            let output = '';
            
            // Show semantic query suggestion if detected
            if (semanticQuery.isSemanticQuery && semanticQuery.suggestion) {
                output += semanticQuery.suggestion;
                output += '\n';
            }

            // Show skill activation check only if skills/agents matched
            if (matchedSkills.length > 0 || matchedAgents.length > 0) {
                output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
                output += '🎯 SKILL ACTIVATION CHECK\n';
                output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

                // Show skills needing validation FIRST
                if (allNeedingValidation.length > 0) {
                    output += '❓ AMBIGUOUS MATCHES (validate before activating):\n';
                    output += '   The following skills matched on keywords that may be used\n';
                    output += '   in a non-technical context. Consider if they\'re needed:\n\n';

                    for (const item of allNeedingValidation) {
                        const isAgent = item.isAgent ? ' [agent]' : '';
                        output += `   • ${item.name}${isAgent}\n`;
                        output += `     Matched: "${item.matchedTerm}" (keyword match)\n`;
                        if (item.config.description) {
                            output += `     Purpose: ${item.config.description}\n`;
                        }
                        output += `     → Skip if the user is NOT asking for this functionality\n`;
                        output += '\n';
                    }

                    output += '   VALIDATION: Before activating these, ask yourself:\n';
                    output += '   "Is the user asking for this skill\'s capability, or just\n';
                    output += '    using the word in everyday language?"\n\n';
                }

                // Group confirmed skills by priority
                const critical = confirmedSkills.filter(s => s.config.priority === 'critical');
                const high = confirmedSkills.filter(s => s.config.priority === 'high');
                const medium = confirmedSkills.filter(s => s.config.priority === 'medium');
                const low = confirmedSkills.filter(s => s.config.priority === 'low');

                if (critical.length > 0) {
                    output += '⚠️ CRITICAL SKILLS (REQUIRED):\n';
                    critical.forEach(s => output += `  → ${s.name}\n`);
                    output += '\n';
                }

                if (high.length > 0) {
                    output += '📚 RECOMMENDED SKILLS:\n';
                    high.forEach(s => output += `  → ${s.name}\n`);
                    output += '\n';
                }

                if (medium.length > 0) {
                    output += '💡 SUGGESTED SKILLS:\n';
                    medium.forEach(s => output += `  → ${s.name}\n`);
                    output += '\n';
                }

                if (low.length > 0) {
                    output += '📌 OPTIONAL SKILLS:\n';
                    low.forEach(s => output += `  → ${s.name}\n`);
                    output += '\n';
                }

                // Add confirmed agents
                if (confirmedAgents.length > 0) {
                    output += '🤖 RECOMMENDED AGENTS (token-efficient):\n';
                    confirmedAgents.forEach(a => output += `  → ${a.name}\n`);
                    output += '\n';
                }

                if (confirmedSkills.length > 0) {
                    output += 'ACTION: Use Skill tool BEFORE responding\n';
                }
                if (confirmedAgents.length > 0) {
                    output += 'ACTION: Use Task tool with agent for exploration\n';
                }
                output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';

                // Check if any matched skill has enforcement: 'block'
                const blockingSkills = matchedSkills.filter(s => s.config.enforcement === 'block');
                if (blockingSkills.length > 0) {
                    // Return blocking response - Claude must invoke the skill first
                    const blockMessage = output + '\n⛔ BLOCKING: You MUST invoke ' +
                        blockingSkills.map(s => s.name).join(', ') +
                        ' skill(s) before generating ANY response.';
                    console.log(JSON.stringify({
                        result: 'block',
                        reason: blockMessage
                    }));
                    process.exit(0);
                }
            }

            console.log(output);
        }

        // Check context % from statusLine temp file and add tiered warnings
        // Use hook input session_id first, then env vars as fallback
        // CLAUDE_PPID kept for backwards compatibility with bash wrapper
        const rawSessionId = data.session_id || process.env.CLAUDE_SESSION_ID || process.env.CLAUDE_PPID || 'default';
        const sessionId = rawSessionId.slice(0, 8);  // Match status.py truncation
        const contextFile = join(tmpdir(), `claude-context-pct-${sessionId}.txt`);
        if (existsSync(contextFile)) {
            try {
                const pct = parseInt(readFileSync(contextFile, 'utf-8').trim(), 10);
                let contextWarning = '';

                if (pct >= 90) {
                    contextWarning = '\n' +
                        '='.repeat(50) + '\n' +
                        '  CONTEXT CRITICAL: ' + pct + '%\n' +
                        '  Run /create_handoff NOW before auto-compact!\n' +
                        '='.repeat(50) + '\n';
                } else if (pct >= 80) {
                    contextWarning = '\n' +
                        'CONTEXT WARNING: ' + pct + '%\n' +
                        'Recommend: /create_handoff then /clear soon\n';
                } else if (pct >= 70) {
                    contextWarning = '\nContext at ' + pct + '%. Consider handoff when you reach a stopping point.\n';
                }

                if (contextWarning) {
                    console.log(contextWarning);
                }
            } catch {
                // Ignore read errors
            }
        }

        // Check resource limits and add advisory warnings
        // Phase 5: Soft Limit Advisory
        const resources = readResourceState();
        if (resources && resources.maxAgents > 0) {
            const utilization = resources.activeAgents / resources.maxAgents;
            let resourceWarning = '';

            if (utilization >= 1.0) {
                // At or over limit: CRITICAL
                resourceWarning = '\n' +
                    '='.repeat(50) + '\n' +
                    'RESOURCE CRITICAL: At limit (' + resources.activeAgents + '/' + resources.maxAgents + ' agents)\n' +
                    'Do NOT spawn new agents until existing ones complete.\n' +
                    '='.repeat(50) + '\n';
            } else if (utilization >= 0.8) {
                // Near limit (80%+): WARNING
                const remaining = resources.maxAgents - resources.activeAgents;
                resourceWarning = '\n' +
                    'RESOURCE WARNING: Near limit (' + resources.activeAgents + '/' + resources.maxAgents + ' agents)\n' +
                    'Only ' + remaining + ' agent slot(s) remaining. Limit spawning.\n';
            }

            if (resourceWarning) {
                console.log(resourceWarning);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Error in skill-activation-prompt hook:', err);
        process.exit(1);
    }
}

main().catch(err => {
    console.error('Uncaught error:', err);
    process.exit(1);
});
