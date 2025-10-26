# 🚀 Quick Start Guide

## Get Started in 5 Minutes

### 1. Open Your Browser
```
http://localhost:5173
```
✅ **Development server is already running!**

### 2. Try the Login Page
The app opens with a login form. For demo purposes (without backend):
- Enter any valid email format: `user@example.com`
- Enter any password: `password123`
- Click "Sign in"

**Note:** Authentication will fail without a backend, but you can bypass it by:
```javascript
// In browser console:
localStorage.setItem('user_data', JSON.stringify({
  user: { 
    id: '1', 
    name: 'Demo User', 
    email: 'demo@codecollab.io',
    role: 'USER',
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  isAuthenticated: true
}));
// Then refresh the page
location.reload();
```

### 3. Explore the Editor

Once "logged in", you'll see:

**Left Sidebar** - File Explorer
- `src/` folder with sample files
- `README.md` file
- Click any file to open it

**Main Area** - Monaco Code Editor
- Full VS Code editor experience
- Syntax highlighting for TypeScript, JavaScript, Markdown
- Line numbers, minimap, IntelliSense

**Top Header**
- CodeCollab logo and name
- Theme toggle (Moon/Sun icon)
- Settings button
- User avatar with logout

### 4. Try These Features

#### Edit Code
1. Click on `src/App.tsx` in file explorer
2. Start typing - see syntax highlighting
3. Try Ctrl+Z (undo) and Ctrl+Y (redo)
4. Code auto-saves every 3 seconds

#### Keyboard Shortcuts
- `Ctrl+B` - Toggle sidebar
- `Ctrl+S` - Save file (manual)
- `Ctrl+F` - Find in file
- `Ctrl+/` - Toggle comment

#### Dark Mode
- Click the Sun/Moon icon in header
- Page switches between light/dark theme

#### File Navigation
- Expand folders by clicking the arrow
- Click files to open them
- Multiple files can be open (see tabs in future)

### 5. Development Workflow

#### Make Code Changes
```bash
# Edit any file in src/
# Changes will hot-reload automatically
```

#### Run Tests
```bash
npm run test
# Or with UI
npm run test:ui
```

#### Check Types
```bash
npm run type-check
```

#### Format Code
```bash
npm run format
```

---

## Project Structure at a Glance

```
collaborative-code-editor/
├── src/
│   ├── App.tsx                    # Main application component
│   ├── main.tsx                   # Entry point
│   ├── features/                  # Feature modules
│   │   ├── auth/                  # Authentication (LoginForm)
│   │   ├── editor/                # Code editor (CodeEditor)
│   │   └── files/                 # File management (FileExplorer)
│   └── shared/                    # Shared utilities
│       ├── components/            # UI components
│       ├── hooks/                 # Custom React hooks
│       ├── services/              # API & WebSocket
│       ├── stores/                # State management
│       └── types/                 # TypeScript types
├── tests/                         # E2E tests
├── README.md                      # Full documentation
├── ARCHITECTURE.md                # System design
└── package.json                   # Dependencies & scripts
```

---

## Key Technologies Used

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool |
| **Monaco Editor** | Code editor (VS Code engine) |
| **Socket.io** | Real-time WebSocket |
| **Zustand** | State management |
| **TailwindCSS** | Styling |
| **React Query** | Server state |
| **Vitest** | Unit testing |
| **Playwright** | E2E testing |

---

## Common Commands

```bash
# Development
npm run dev              # Start dev server (already running!)
npm run build           # Production build
npm run preview         # Preview production build

# Code Quality
npm run lint            # Check for errors
npm run lint:fix        # Auto-fix errors
npm run format          # Format code
npm run type-check      # TypeScript check

# Testing
npm run test            # Run unit tests
npm run test:ui         # Open Vitest UI
npm run test:coverage   # Check coverage
npm run test:e2e        # Run E2E tests
```

---

## What Works Right Now

✅ **UI & Navigation**
- Login page with validation
- Header with theme toggle
- File explorer with tree view
- Monaco code editor

✅ **Code Editing**
- Syntax highlighting (17+ languages)
- Auto-save (3 second debounce)
- Undo/Redo
- Find & Replace (Ctrl+F, Ctrl+H)
- Multiple language support

✅ **User Experience**
- Dark mode toggle
- Keyboard shortcuts
- Responsive design
- Loading states
- Toast notifications

✅ **Accessibility**
- Screen reader support
- Keyboard navigation
- ARIA labels
- Focus indicators
- Skip links

✅ **Code Quality**
- TypeScript strict mode
- ESLint configured
- Prettier formatting
- Unit test examples
- E2E test examples

---

## What Needs Backend

⚠️ **These features require a backend API:**
- User authentication (JWT tokens)
- Real-time collaboration (WebSocket server)
- File persistence (database)
- User sessions
- OAuth providers (Google, GitHub)

**Backend Implementation Guide:** See `ARCHITECTURE.md` for API specifications

---

## Next Actions

### Immediate (Do Now)
1. ✅ Browse the code in VS Code
2. ✅ Try the app at http://localhost:5173
3. ✅ Read README.md for full details
4. ✅ Experiment with the editor

### Today
1. Review the architecture (`ARCHITECTURE.md`)
2. Explore the codebase structure
3. Run the tests (`npm run test`)
4. Try building (`npm run build`)

### This Week
1. Set up backend API (Node.js/Express)
2. Implement authentication endpoints
3. Add WebSocket server for real-time features
4. Connect frontend to backend
5. Deploy to Vercel/Netlify

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

### Hot Reload Not Working
```bash
# Restart dev server
# Press Ctrl+C, then run:
npm run dev
```

### TypeScript Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Fails
```bash
# Clear build cache
rm -rf dist .vite
npm run build
```

---

## Getting Help

📚 **Documentation**
- `README.md` - Full documentation
- `ARCHITECTURE.md` - System design
- `CONTRIBUTING.md` - Development guide
- `DEPLOYMENT.md` - Deploy guide

💬 **Resources**
- [React Docs](https://react.dev)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [TailwindCSS](https://tailwindcss.com)
- [Zustand](https://docs.pmnd.rs/zustand/)

---

## Tips & Tricks

### Developer Tools
- Open React DevTools (browser extension)
- Use Redux DevTools for Zustand
- Check Network tab for API calls
- Console for WebSocket logs

### Code Navigation
- `Cmd+P` (Mac) / `Ctrl+P` (Win) - Quick file open in VS Code
- `Cmd+Shift+F` - Search across all files
- `F12` - Go to definition

### Performance
- Check bundle size: `npm run build`
- Use React DevTools Profiler
- Monitor Network tab
- Check Lighthouse score

---

**🎉 You're all set! Start building your collaborative coding platform!**

*Questions? Check the documentation or create an issue.*
