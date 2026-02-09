/**
 * Parser Module Index
 *
 * Exports all parser functionality. New code should use UnifiedParser directly.
 *
 * ## Parser Pipeline
 *
 * ```
 * smartParse(prompt, context)
 *   → UnifiedParser.parse(prompt)
 *     → detectCommandType(prompt)         [patterns.ts]
 *     → route to handler (create/add/remove/modify/connect/disconnect/query)
 *     → parsePromptLocal(prompt)           [templateMatcher.ts]
 *       → matchTemplateByKeywords()        [templateMatcher.ts]
 *       → matchTemplateById()             [templateMatcher.ts]
 *       → parseCustomPrompt(prompt)       [componentDetector.ts]
 *         → detectAllNodeTypes(prompt)    [componentDetector.ts / patterns.ts]
 *       → fallback template
 *
 * ```
 *
 * For LLM-based parsing, see `intelligentParser.ts` (used by `api/parse/route.ts`).
 * For LLM-based modification, see `contextBuilder.ts` + `prompts.ts` + `responseValidator.ts` + `diffApplier.ts`.
 */

// ============================================================
// Unified Parser (Recommended)
// ============================================================
export {
  UnifiedParser,
  defaultParser,
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
