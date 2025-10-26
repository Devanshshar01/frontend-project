# Architecture Documentation

## System Overview

CodeCollab is a real-time collaborative code editor built with a modern, scalable architecture following SOLID principles and domain-driven design patterns.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React UI   │  │  Monaco      │  │  WebSocket   │      │
│  │  Components  │  │   Editor     │  │   Client     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                │                  │              │
│           └────────────────┴──────────────────┘              │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
                  State Management
           ┌──────────────┼──────────────┐
           │              │              │
      ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
      │  Auth   │   │ Editor  │   │Collab   │
      │  Store  │   │  Store  │   │ Store   │
      └─────────┘   └─────────┘   └─────────┘
                          │
                  ┌───────┴───────┐
                  │               │
           ┌──────▼──────┐ ┌─────▼──────┐
           │ API Service │ │   WebSocket │
           │  (Axios)    │ │   Service   │
           └─────────────┘ └─────────────┘
                  │               │
                  └───────┬───────┘
                          │
┌─────────────────────────┼────────────────────────────────────┐
│                    Server Layer (Backend)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  REST API    │  │  WebSocket   │  │   Database   │      │
│  │  Endpoints   │  │   Server     │  │  (PostgreSQL)│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Atomic Design Pattern

Components are organized following atomic design principles:

**Atoms** - Basic building blocks
- Button, Input, Spinner, Badge, Avatar

**Molecules** - Simple component groups
- FormField (Input + Label), SearchBar, UserCard

**Organisms** - Complex components
- Header, FileExplorer, CodeEditor, Sidebar

**Templates** - Page layouts
- DashboardTemplate, EditorTemplate, AuthTemplate

**Pages** - Full pages
- LoginPage, EditorPage, SettingsPage

### Feature-Based Structure

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── editor/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   ├── collaboration/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   └── files/
│       ├── components/
│       └── services/
└── shared/
    ├── components/
    ├── hooks/
    ├── services/
    ├── stores/
    ├── types/
    └── utils/
```

## State Management Strategy

### Global State (Zustand)

**AuthStore**
- User authentication state
- JWT tokens (in httpOnly cookies)
- User profile data

**EditorStore**
- Current file
- Open files/tabs
- Editor settings (theme, font size, etc.)
- UI state (sidebar, modals)

**CollaborationStore**
- Active session
- Connected participants
- Cursor positions
- Typing indicators

### Server State (React Query)

- API data fetching
- Caching with staleTime
- Automatic background refetching
- Optimistic updates

### Local State (useState/useReducer)

- Component-specific UI state
- Form inputs
- Temporary data

## Data Flow

### Authentication Flow

```
User Login
    │
    ├──> API Request (POST /auth/login)
    │
    ├──> Server validates credentials
    │
    ├──> JWT tokens generated
    │
    ├──> Tokens stored in localStorage
    │
    ├──> AuthStore updated
    │
    └──> Redirect to editor
```

### Real-Time Collaboration Flow

```
User Types
    │
    ├──> Editor onChange event
    │
    ├──> Debounced (100ms)
    │
    ├──> WebSocket emit (CONTENT_CHANGE)
    │
    ├──> Server broadcasts to other clients
    │
    ├──> Clients receive change
    │
    ├──> CRDT merge (Yjs)
    │
    └──> Monaco Editor updates
```

### Cursor Position Sync

```
Cursor Moves
    │
    ├──> Editor onCursorPositionChange
    │
    ├──> Throttled (100ms)
    │
    ├──> WebSocket emit (CURSOR_MOVE)
    │
    ├──> Server broadcasts
    │
    ├──> Clients update CollaborationStore
    │
    └──> Remote cursors rendered
```

## API Layer

### Centralized API Service

```typescript
class ApiService {
  - Axios instance with interceptors
  - Automatic token refresh
  - Request retry logic (3 attempts)
  - Error normalization
  - Request/response logging
}
```

### Interceptors

**Request Interceptor:**
- Attach JWT token to headers
- Add request timestamp
- Log outgoing requests (dev only)

**Response Interceptor:**
- Handle 401 (token refresh)
- Handle 5xx (retry logic)
- Normalize error responses
- Extract data from response wrapper

## WebSocket Service

### Connection Management

- Automatic reconnection (exponential backoff)
- Heartbeat/ping-pong every 30s
- Connection state tracking
- Event subscription system

### Event Types

```typescript
WebSocketEventType {
  CONNECT
  DISCONNECT
  JOIN_SESSION
  LEAVE_SESSION
  CURSOR_MOVE
  CONTENT_CHANGE
  USER_TYPING
  PRESENCE_UPDATE
  ERROR
}
```

## Conflict Resolution (CRDT)

Using Yjs for Conflict-Free Replicated Data Types:

1. Each change is a operation (insert/delete)
2. Operations are commutative
3. Concurrent edits merge deterministically
4. No "last write wins" conflicts
5. Guaranteed convergence

## Performance Optimizations

### Code Splitting

```typescript
// Route-based splitting
const EditorPage = lazy(() => import('./pages/EditorPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Component-based splitting
const Monaco = lazy(() => import('@monaco-editor/react'));
```

### Memoization

- React.memo for expensive components
- useMemo for expensive calculations
- useCallback for event handlers passed as props

### Virtualization

- Virtual scrolling for large file lists
- Monaco's built-in virtualization for large files

### Debouncing & Throttling

- Auto-save: 3000ms debounce
- Cursor updates: 100ms throttle
- Search: 300ms debounce

## Security Architecture

### Authentication

- JWT access token (15 min expiry)
- JWT refresh token (7 day expiry)
- Tokens in httpOnly cookies (not localStorage for sensitive data)
- CSRF tokens for state-changing requests

### Authorization

- Role-based access control (RBAC)
- File ownership checks
- Session-based collaboration permissions

### Input Validation

- Client-side validation (UX)
- Server-side validation (security)
- DOMPurify for HTML sanitization
- Parameterized queries (SQL injection prevention)

### Network Security

- HTTPS only in production
- CORS properly configured
- Rate limiting (100 req/min per user)
- Content Security Policy headers

## Scalability Considerations

### Horizontal Scaling

- Stateless API servers
- WebSocket server clustering (Socket.io Redis adapter)
- Load balancer with sticky sessions
- CDN for static assets

### Caching Strategy

- HTTP caching headers (ETag, Cache-Control)
- Service Worker for offline assets
- React Query for API response caching
- Redis for server-side session caching

### Database Optimization

- Indexed queries on user_id, file_id
- Connection pooling
- Read replicas for analytics
- Partitioning for large tables

## Monitoring & Observability

### Error Tracking

- Sentry for error reporting
- Source maps for production debugging
- Custom error boundaries

### Analytics

- Google Analytics / Mixpanel
- Custom event tracking
- User behavior analysis

### Performance Monitoring

- Web Vitals tracking
- Lighthouse CI in pipeline
- Real User Monitoring (RUM)
- Bundle size monitoring

## Deployment Architecture

### CI/CD Pipeline

```
Git Push
    │
    ├──> GitHub Actions
    │
    ├──> Lint & Type Check
    │
    ├──> Unit Tests (80%+ coverage)
    │
    ├──> E2E Tests (Playwright)
    │
    ├──> Build (Vite)
    │
    ├──> Bundle Analysis
    │
    ├──> Lighthouse CI
    │
    ├──> Deploy to Staging
    │
    ├──> Smoke Tests
    │
    └──> Deploy to Production (on approval)
```

### Environment Setup

- **Development**: localhost with hot reload
- **Staging**: staging.codecollab.io (auto-deploy from develop)
- **Production**: codecollab.io (manual deploy from main)

### Hosting

- Vercel / Netlify for frontend
- AWS / GCP for backend
- CloudFlare for CDN

## Testing Strategy

### Unit Tests (Vitest)

- All utility functions
- Custom hooks
- Store actions
- Component logic

### Integration Tests

- Form submissions
- API mocking (MSW)
- State management flows

### E2E Tests (Playwright)

- Authentication flow
- File creation and editing
- Real-time collaboration
- Keyboard shortcuts

## Future Enhancements

1. **AI Code Completion** - OpenAI integration
2. **Video Chat** - WebRTC for face-to-face collaboration
3. **Version Control** - Git integration
4. **Plugin System** - Extensible architecture
5. **Mobile Apps** - React Native versions

---

*Last Updated: January 2025*
*Architecture Version: 1.0*
