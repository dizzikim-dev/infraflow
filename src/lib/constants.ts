/**
 * Application Constants
 * 매직 넘버와 하드코딩된 값들을 한 곳에서 관리
 */

// History & Undo/Redo
export const HISTORY_MAX_SIZE = 50;
export const HISTORY_DEBOUNCE_MS = 300;

// Animation
export const ANIMATION_SPEED_MIN = 0.25;
export const ANIMATION_SPEED_MAX = 4;
export const ANIMATION_DEFAULT_SPEED = 1;

// Layout
export const LAYOUT_NODE_WIDTH = 160;
export const LAYOUT_NODE_HEIGHT = 80;
export const LAYOUT_HORIZONTAL_GAP = 220;
export const LAYOUT_VERTICAL_GAP = 100;
export const LAYOUT_TIER_GAP = 280;
export const LAYOUT_START_X = 150;
export const LAYOUT_START_Y = 150;

// Validation
export const MAX_PROMPT_LENGTH = 2000;
export const MAX_NODES = 100;
export const MAX_EDGES = 200;

// Storage
export const STORAGE_TEMPLATES_KEY = 'infraflow-custom-templates';
export const STORAGE_SETTINGS_KEY = 'infraflow-settings';

// UI
export const TOAST_DURATION_MS = 3000;
export const LOADING_DELAY_MS = 0; // Previously was 300ms artificial delay

// Confidence Thresholds
export const CONFIDENCE_HIGH = 0.7;
export const CONFIDENCE_MEDIUM = 0.5;
export const CONFIDENCE_LOW = 0.3;
