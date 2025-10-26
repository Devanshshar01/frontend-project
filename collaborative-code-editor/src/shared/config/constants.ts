/**
 * Application-wide constants
 * Following best practices: no magic numbers, centralized configuration
 */

export const APP_CONFIG = {
  NAME: 'CodeCollab',
  VERSION: '1.0.0',
  DESCRIPTION: 'Real-Time Collaborative Code Editor',
} as const;

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

export const WEBSOCKET_CONFIG = {
  URL: import.meta.env.VITE_WS_URL || 'ws://localhost:3001',
  RECONNECT_INTERVAL: 3000, // 3 seconds
  MAX_RECONNECT_ATTEMPTS: 5,
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
} as const;

export const EDITOR_CONFIG = {
  DEFAULT_THEME: 'vs-dark',
  DEFAULT_LANGUAGE: 'typescript',
  DEFAULT_FONT_SIZE: 14,
  DEFAULT_TAB_SIZE: 2,
  AUTO_SAVE_DELAY: 3000, // 3 seconds - as per requirements
  CURSOR_BLINK_RATE: 530, // milliseconds
  MINIMAP_ENABLED: true,
  LINE_NUMBERS_ENABLED: true,
  WORD_WRAP: true,
} as const;

export const AUTH_CONFIG = {
  TOKEN_KEY: 'auth_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  USER_KEY: 'user_data',
  SESSION_TIMEOUT: 1800000, // 30 minutes in milliseconds
  TOKEN_REFRESH_THRESHOLD: 300000, // Refresh token 5 minutes before expiry
} as const;

export const COLLABORATION_CONFIG = {
  MAX_PARTICIPANTS: 10,
  CURSOR_UPDATE_THROTTLE: 100, // milliseconds
  TYPING_INDICATOR_TIMEOUT: 2000, // 2 seconds
  PRESENCE_UPDATE_INTERVAL: 5000, // 5 seconds
  LATENCY_TARGET: 100, // Target <100ms latency as per requirements
} as const;

export const PERFORMANCE_TARGETS = {
  FCP: 1500, // First Contentful Paint < 1.5s
  LCP: 2500, // Largest Contentful Paint < 2.5s
  TTI: 3500, // Time to Interactive < 3.5s
  CLS: 0.1, // Cumulative Layout Shift < 0.1
  FID: 100, // First Input Delay < 100ms
  LIGHTHOUSE_SCORE_MIN: 90,
} as const;

export const ACCESSIBILITY_CONFIG = {
  SKIP_LINK_ID: 'main-content',
  FOCUS_RING_WIDTH: 2, // pixels
  MIN_TOUCH_TARGET: 44, // 44x44px for mobile
  CONTRAST_RATIO_NORMAL: 4.5,
  CONTRAST_RATIO_LARGE: 3,
} as const;

export const KEYBOARD_SHORTCUTS = [
  { key: 'S', ctrl: true, action: 'save', description: 'Save file' },
  { key: 'F', ctrl: true, action: 'find', description: 'Find in file' },
  { key: 'H', ctrl: true, action: 'replace', description: 'Find and replace' },
  { key: 'Z', ctrl: true, action: 'undo', description: 'Undo' },
  { key: 'Y', ctrl: true, action: 'redo', description: 'Redo' },
  { key: 'D', ctrl: true, action: 'duplicate', description: 'Duplicate line' },
  { key: '/', ctrl: true, action: 'comment', description: 'Toggle comment' },
  { key: 'P', ctrl: true, shift: true, action: 'command', description: 'Command palette' },
  { key: 'B', ctrl: true, action: 'sidebar', description: 'Toggle sidebar' },
  { key: '?', shift: true, action: 'shortcuts', description: 'Show shortcuts' },
] as const;

export const FILE_EXTENSIONS = {
  typescript: '.ts',
  javascript: '.js',
  python: '.py',
  java: '.java',
  cpp: '.cpp',
  csharp: '.cs',
  go: '.go',
  rust: '.rs',
  ruby: '.rb',
  php: '.php',
  html: '.html',
  css: '.css',
  json: '.json',
  markdown: '.md',
  yaml: '.yaml',
  xml: '.xml',
  sql: '.sql',
} as const;

export const LANGUAGE_NAMES = {
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  csharp: 'C#',
  go: 'Go',
  rust: 'Rust',
  ruby: 'Ruby',
  php: 'PHP',
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
  markdown: 'Markdown',
  yaml: 'YAML',
  xml: 'XML',
  sql: 'SQL',
} as const;

export const USER_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#FFA07A',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E2',
  '#F8B739',
  '#52C41A',
] as const;

export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  FILE_NAME_REGEX: /^[a-zA-Z0-9_.-]+$/,
  PROJECT_NAME_MIN_LENGTH: 3,
  PROJECT_NAME_MAX_LENGTH: 50,
  FILE_NAME_MAX_LENGTH: 100,
  MAX_FILE_SIZE: 5242880, // 5MB in bytes
} as const;
