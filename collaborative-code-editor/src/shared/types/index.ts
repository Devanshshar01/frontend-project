// Core application types following strict TypeScript practices

/**
 * User entity with authentication details
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User roles for authorization
 */
export const UserRole = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  GUEST: 'GUEST',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/**
 * Authentication response from server
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * File/Document entity in the editor
 */
export interface FileDocument {
  id: string;
  name: string;
  language: ProgrammingLanguage;
  content: string;
  ownerId: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
}

/**
 * Supported programming languages
 */
export type ProgrammingLanguage =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'java'
  | 'cpp'
  | 'csharp'
  | 'go'
  | 'rust'
  | 'ruby'
  | 'php'
  | 'html'
  | 'css'
  | 'json'
  | 'markdown'
  | 'yaml'
  | 'xml'
  | 'sql';

/**
 * Collaborative editing session
 */
export interface CollaborationSession {
  id: string;
  documentId: string;
  participants: Participant[];
  createdAt: Date;
  isActive: boolean;
}

/**
 * Participant in a collaboration session
 */
export interface Participant {
  user: User;
  cursorPosition: CursorPosition;
  selectionRange: SelectionRange | null;
  color: string;
  isActive: boolean;
  lastSeen: Date;
}

/**
 * Cursor position in the editor
 */
export interface CursorPosition {
  lineNumber: number;
  column: number;
}

/**
 * Selection range in the editor
 */
export interface SelectionRange {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

/**
 * Real-time change operation for CRDT
 */
export interface ChangeOperation {
  type: 'insert' | 'delete' | 'replace';
  position: CursorPosition;
  content: string;
  userId: string;
  timestamp: number;
  version: number;
}

/**
 * WebSocket message types
 */
export const WebSocketEventType = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_SESSION: 'join_session',
  LEAVE_SESSION: 'leave_session',
  CURSOR_MOVE: 'cursor_move',
  CONTENT_CHANGE: 'content_change',
  USER_TYPING: 'user_typing',
  PRESENCE_UPDATE: 'presence_update',
  ERROR: 'error',
} as const;

export type WebSocketEventType = (typeof WebSocketEventType)[keyof typeof WebSocketEventType];

/**
 * WebSocket message payload
 */
export interface WebSocketMessage<T = unknown> {
  type: WebSocketEventType;
  payload: T;
  sessionId: string;
  userId: string;
  timestamp: number;
}

/**
 * Project entity containing multiple files
 */
export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  files: FileDocument[];
  collaborators: User[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
}

/**
 * API error response
 */
export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: number;
}

/**
 * Editor theme configuration
 */
export interface EditorTheme {
  name: string;
  isDark: boolean;
}

/**
 * Editor settings/preferences
 */
export interface EditorSettings {
  theme: EditorTheme;
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  autoSave: boolean;
  autoSaveDelay: number;
}

/**
 * Keyboard shortcut configuration
 */
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: string;
  description: string;
}
