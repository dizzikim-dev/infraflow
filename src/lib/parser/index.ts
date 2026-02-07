/**
 * Parser Module Index
 *
 * Exports all parser functionality.
 * New code should use UnifiedParser directly.
 */

// ============================================================
// Unified Parser (Recommended)
// ============================================================
export {
  UnifiedParser,
  defaultParser,
  parsePrompt,
  smartParse,
  createContext,
  updateContext,
  getAvailableTemplates,
  getTemplate,
  type ParseResult,
  type SmartParseResult,
  type SpecModification,
  type ConversationContext,
  type PromptHistoryItem,
  type ParseOptions,
} from './UnifiedParser';

// ============================================================
// Templates
// ============================================================
export { infraTemplates, templateKeywords } from './templates';

// ============================================================
// Patterns (Shared utilities)
// ============================================================
export {
  nodeTypePatterns,
  commandPatterns,
  detectNodeType,
  detectAllNodeTypes,
  detectCommandType,
  findPatternByType,
  type CommandType,
  type NodeTypePattern,
  type CommandPattern,
} from './patterns';

// ============================================================
// Intelligent Parser (LLM-based)
// ============================================================
export {
  INTENT_ANALYSIS_PROMPT,
  parseIntentResponse,
  applyIntentToSpec,
  type IntentAnalysis,
  type ExtractedComponent,
  type PositionInfo,
} from './intelligentParser';
