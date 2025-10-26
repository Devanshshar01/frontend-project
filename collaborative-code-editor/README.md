# VS Code Clone - Fully Working Code Editor

A production-ready, VS Code-like code editor built with React, TypeScript, and Monaco Editor. Features complete file management, auto-save, and support for 15+ programming languages.

## ✨ Features

### 🎯 Core Features
- **Monaco Editor** - Full VS Code editor experience in the browser
- **Multi-Language Support** - JavaScript, TypeScript, Python, HTML, CSS, C, C++, Java, Go, Rust, Shell, Bash, JSON, Markdown, and more
- **Auto-Save** - Automatic saving every 2 seconds with visual indicator
- **Manual Save** - Ctrl+S / Cmd+S keyboard shortcut
- **Tab Management** - Open multiple files in tabs, close tabs individually
- **VS Code-like UI** - Dark theme with familiar layout and colors

### 📁 File Management
- **Create Files** - Right-click or use toolbar buttons
- **Create Folders** - Organize your code with nested folders
- **Rename** - Inline renaming with Enter/Escape keys
- **Delete** - Remove files and folders with confirmation
- **File Explorer** - Tree view with expand/collapse functionality
- **Context Menu** - Right-click for file operations
- **localStorage Persistence** - All changes saved automatically

### 💻 Editor Features
- **Syntax Highlighting** - Context-aware for all supported languages
- **Line Numbers** - Always visible with current line highlight
- **Minimap** - Code overview on the right side
- **Word Wrap** - Automatic text wrapping
- **Cursor Position** - Live tracking in status bar
- **File Info** - Language and line count in status bar
- **Bracket Matching** - Automatic bracket pair colorization
- **Code Folding** - Collapse/expand code blocks

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type check
npm run type-check
```

The app will be available at `http://localhost:5173`

## 📖 Usage

### Creating Files
1. Click the **+** (New File) button in the Explorer header
2. Or right-click on a folder and select "New File"
3. Enter the filename with extension (e.g., `app.js`, `style.css`)

### Creating Folders
1. Click the folder **+** button in the Explorer header
2. Or right-click on a folder and select "New Folder"
3. Enter the folder name

### Editing Files
1. Click on any file in the Explorer to open it
2. The file opens in a new tab
3. Start typing - changes auto-save after 2 seconds
4. Press **Ctrl+S** / **Cmd+S** to save immediately
5. Unsaved changes show an indicator in the top-right corner

### Renaming Files/Folders
1. Right-click on a file or folder
2. Select "Rename"
3. Type the new name
4. Press **Enter** to confirm or **Esc** to cancel

### Deleting Files/Folders
1. Right-click on a file or folder
2. Select "Delete"
3. Confirm the deletion

### Managing Tabs
- **Switch Tabs** - Click on any tab to switch files
- **Close Tab** - Click the X button on the tab
- Closing the current file switches to the last open tab

### Toggle Sidebar
- Click the menu icon (☰) or X in the top-left to show/hide the file explorer

## 🌐 Supported Languages

The editor automatically detects language based on file extension:

| Extension | Language |
|-----------|----------|
| .js, .jsx | JavaScript |
| .ts, .tsx | TypeScript |
| .py | Python |
| .html | HTML |
| .css | CSS |
| .c, .h | C |
| .cpp, .hpp | C++ |
| .java | Java |
| .go | Go |
| .rs | Rust |
| .sh, .bash | Shell |
| .json | JSON |
| .md | Markdown |
| .php | PHP |
| .rb | Ruby |
| .sql | SQL |

## 🎨 UI Components

- **Header** - Toggle sidebar, app title, current file path
- **File Explorer** - Tree view with file/folder operations
- **Tab Bar** - Open file tabs with close buttons
- **Editor** - Monaco editor with syntax highlighting
- **Status Bar** - File info, language, cursor position, line count

## 💾 Data Persistence

All files and folders are stored in browser localStorage:
- Files persist across browser sessions
- Changes are saved automatically
- Clear browser data to reset

## 🔧 Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Monaco Editor** - Code editing
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **nanoid** - Unique ID generation
- **Lucide React** - Icons

## 📁 Project Structure

```
src/
├── App.tsx                      # Main application
├── features/
│   ├── editor/
│   │   └── components/
│   │       └── CodeEditor.tsx   # Monaco editor wrapper
│   └── files/
│       └── components/
│           └── FileExplorer.tsx # File tree component
└── shared/
    ├── components/
    │   └── organisms/
    │       ├── TabBar.tsx       # File tabs
    │       └── StatusBar.tsx    # Bottom status bar
    └── services/
        └── filesystem.service.ts # File management logic
```

## 🎯 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Ctrl+S** / **Cmd+S** | Save file |
| **Enter** | Confirm rename |
| **Esc** | Cancel rename |
| **Right-click** | Open context menu |

## 🚀 Deployment

The app is ready to deploy to any static hosting service:

```bash
# Build for production
npm run build

# The dist/ folder contains the production build
```

Deploy to:
- **Vercel** - `vercel deploy`
- **Netlify** - Drag & drop `dist/` folder
- **GitHub Pages** - Push `dist/` to gh-pages branch

## 📝 License

MIT License - feel free to use this project for learning or production!

## 🙏 Acknowledgments

- Monaco Editor by Microsoft
- React team for React 19
- Vite team for blazing-fast builds

---

**Built with ❤️ as a fully functional VS Code clone**
