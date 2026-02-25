/**
 * Structured Response metadata from LLM.
 * Complements InfraSpec with consulting-grade context.
 */

export interface ResponseOption {
  name: string;
  pros: string[];
  cons: string[];
  estimatedCostRange?: string;
}

export interface StructuredResponseMeta {
  summary: string;
  assumptions: string[];
  options: ResponseOption[];
  tradeoffs: string[];
  artifacts: string[];
}
