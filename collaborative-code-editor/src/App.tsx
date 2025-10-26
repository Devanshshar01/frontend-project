import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Header } from './shared/components/organisms/Header';
import { FileExplorer } from './features/files/components/FileExplorer';
import { CodeEditor } from './features/editor/components/CodeEditor';
import { LoginForm } from './features/auth/components/LoginForm';
import { useAuthStore } from './shared/stores/authStore';
import { useEditorStore } from './shared/stores/editorStore';
import { useCollaborationStore } from './shared/stores/collaborationStore';
import { websocketService } from './shared/services/websocket.service';
import { useKeyboardShortcut } from './shared/hooks/useKeyboardShortcut';

/**
 * Main App Component
 * Production-grade collaborative code editor with real-time features
 */

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 3,
      staleTime: 5000,
    },
  },
});

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const { isSidebarOpen, toggleSidebar, toggleCommandPalette } = useEditorStore();
  const { setConnected } = useCollaborationStore();
  const [isConnecting, setIsConnecting] = useState(false);

  // Mock file tree for demonstration
  const mockFiles = [
    {
      id: '1',
      name: 'src',
      type: 'folder' as const,
      children: [
        {
          id: '2',
          name: 'App.tsx',
          type: 'file' as const,
          file: {
            id: '2',
            name: 'App.tsx',
            language: 'typescript' as const,
            content: '// Welcome to CodeCollab!\n// Start typing to collaborate in real-time\n\nfunction App() {\n  return <div>Hello World</div>;\n}\n\nexport default App;',
            ownerId: user?.id || '',
            projectId: 'demo',
            createdAt: new Date(),
            updatedAt: new Date(),
            isPublic: false,
          },
        },
        {
          id: '3',
          name: 'components',
          type: 'folder' as const,
          children: [
            {
              id: '4',
              name: 'Button.tsx',
              type: 'file' as const,
              file: {
                id: '4',
                name: 'Button.tsx',
                language: 'typescript' as const,
                content: '// Button component\nimport React from "react";\n\ninterface ButtonProps {\n  children: React.ReactNode;\n  onClick?: () => void;\n}\n\nexport function Button({ children, onClick }: ButtonProps) {\n  return (\n    <button onClick={onClick}>\n      {children}\n    </button>\n  );\n}',
                ownerId: user?.id || '',
                projectId: 'demo',
                createdAt: new Date(),
                updatedAt: new Date(),
                isPublic: false,
              },
            },
          ],
        },
      ],
    },
    {
      id: '5',
      name: 'README.md',
      type: 'file' as const,
      file: {
        id: '5',
        name: 'README.md',
        language: 'markdown' as const,
        content: '# CodeCollab - Real-Time Collaborative Code Editor\n\n## Features\n- Real-time collaboration\n- Syntax highlighting\n- Auto-save\n- Multiple language support\n\nStart collaborating now!',
        ownerId: user?.id || '',
        projectId: 'demo',
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: false,
      },
    },
  ];

  // Initialize WebSocket connection when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setIsConnecting(true);
      
      websocketService
        .connect(user.id, 'demo-session')
        .then(() => {
          setConnected(true);
          setIsConnecting(false);
        })
        .catch((error) => {
          console.error('WebSocket connection failed:', error);
          setIsConnecting(false);
        });

      return () => {
        websocketService.disconnect();
        setConnected(false);
      };
    }
  }, [isAuthenticated, user, setConnected]);

  // Global keyboard shortcuts
  useKeyboardShortcut('b', toggleSidebar, { ctrl: true });
  useKeyboardShortcut('p', toggleCommandPalette, { ctrl: true, shift: true });
  useKeyboardShortcut('/', () => {
    // Show keyboard shortcuts modal
  }, { shift: true });

  // Show login only in production. In development, bypass auth to access the app.
  if (!isAuthenticated && import.meta.env.PROD) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <LoginForm />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
        {/* Skip to main content link for accessibility */}
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>

        <Header />

        <div className="flex flex-1 overflow-hidden">
          {isSidebarOpen && (
            <FileExplorer
              files={mockFiles}
              onFileCreate={() => {
                // Handle file creation
              }}
              onFolderCreate={() => {
                // Handle folder creation
              }}
            />
          )}

          <main id="main-content" className="flex-1 overflow-hidden">
            <CodeEditor
              onSave={async (content) => {
                // Handle save
                console.log('Saving content:', content.substring(0, 50));
              }}
              onCursorPositionChange={(position) => {
                // Send cursor position to other users
                if (websocketService.connected) {
                  websocketService.sendCursorUpdate(position);
                }
              }}
            />
          </main>
        </div>

        {/* Connection status indicator */}
        {isConnecting && (
          <div className="fixed bottom-4 right-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-600 rounded-lg px-4 py-2 shadow-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              Connecting to collaboration server...
            </p>
          </div>
        )}

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--background)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </QueryClientProvider>
  );
}

export default App;
