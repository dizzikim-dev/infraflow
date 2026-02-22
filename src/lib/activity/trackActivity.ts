import { nanoid } from 'nanoid';

// Session ID: unique per browser tab (module-level singleton)
const SESSION_ID = nanoid(8);

export function getSessionId(): string {
  return SESSION_ID;
}

export type ActivityType =
  | 'prompt_submit'
  | 'llm_modify'
  | 'template_select'
  | 'node_add'
  | 'node_delete'
  | 'node_duplicate'
  | 'node_update'
  | 'edge_add'
  | 'edge_delete'
  | 'edge_reverse'
  | 'diagram_create'
  | 'diagram_update'
  | 'export';

interface ActivityPayload {
  diagramId?: string | null;
  prompt?: string;
  detail?: Record<string, unknown>;
}

/**
 * Fire-and-forget activity tracking.
 * Never throws — silently swallows errors to avoid disrupting UX.
 */
export async function trackActivity(
  type: ActivityType,
  payload: ActivityPayload = {},
): Promise<void> {
  try {
    await fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        sessionId: SESSION_ID,
        diagramId: payload.diagramId ?? null,
        prompt: payload.prompt,
        detail: payload.detail,
      }),
    });
  } catch {
    // Fire-and-forget: never disrupt user flow
  }
}
