/**
 * Plugin Integration Module
 *
 * Handles integration with the plugin registry for dynamic pattern and template loading.
 */

import { infraTemplates } from './templates';
import {
  nodeTypePatterns as defaultNodeTypePatterns,
  type NodeTypePattern,
} from './patterns';
import type { ParserExtension } from '@/types/plugin';
import type { InfraSpec } from '@/types';
import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('PluginIntegration');

/**
 * Get node type patterns from plugin registry
 * Falls back to default patterns if registry is unavailable
 */
export function getNodeTypePatternsFromRegistry(): NodeTypePattern[] {
  try {
    const { pluginRegistry } = require('@/lib/plugins/registry');
    const patterns = pluginRegistry.getAllPatterns();
    return patterns.length > 0 ? patterns : defaultNodeTypePatterns;
  } catch (error) {
    logger.warn('Plugin patterns unavailable, using defaults', {
      error: error instanceof Error ? error.message : String(error),
    });
    return defaultNodeTypePatterns;
  }
}

/**
 * Get templates from plugin registry
 * Merges plugin templates with built-in templates
 */
export function getTemplatesFromRegistry(): Record<string, InfraSpec> {
  try {
    const { pluginRegistry } = require('@/lib/plugins/registry');
    const templates = pluginRegistry.getAllTemplates();
    return { ...infraTemplates, ...templates };
  } catch (error) {
    logger.warn('Plugin templates unavailable, using built-in templates', {
      error: error instanceof Error ? error.message : String(error),
    });
    return infraTemplates;
  }
}

/**
 * Get parser extensions from plugin registry
 */
export function getParserExtensionsFromRegistry(): ParserExtension[] {
  try {
    const { pluginRegistry } = require('@/lib/plugins/registry');
    return pluginRegistry.getParserExtensions();
  } catch (error) {
    logger.warn('Parser extensions unavailable from registry', {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}
