/**
 * Shared Module Barrel Exports
 *
 * Central export point for all shared utilities.
 */

// Resource utilities
export {
  readResourceState,
  getResourceFilePath,
  getSessionId,
  DEFAULT_RESOURCE_STATE,
} from './resource-reader.js';

export type { ResourceState } from './resource-reader.js';

export { getSystemResources } from './resource-utils.js';

export type { SystemResources } from './resource-utils.js';

// Skill router types
export type {
  SkillRouterInput,
  SkillRouterOutput,
  SkillLookupResult,
  SkillTrigger,
  SkillRule,
  SkillRulesConfig,
} from './skill-router-types.js';

export { CircularDependencyError } from './skill-router-types.js';

// Project state
export { getProjectState } from './project-state.js';

// Session ID
export { getOrCreateSessionId } from './session-id.js';

// Common types
export type {
  SubagentStartInput,
  SubagentStopInput,
  PreToolUseInput,
  PostToolUseInput,
  StopInput,
  HookOutput,
  QueryResult,
} from './types.js';
