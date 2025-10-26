import { useState } from 'react';
import { Menu, Moon, Sun, Users, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useEditorStore } from '../../stores/editorStore';
import { useCollaborationStore } from '../../stores/collaborationStore';
import { Button } from '../atoms/Button';
import { APP_CONFIG } from '../../config/constants';

/**
 * Application header with navigation and user menu
 * Implements accessible navigation patterns
 */

export function Header() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { user, clearAuth } = useAuthStore();
  const { toggleSidebar } = useEditorStore();
  const { participants } = useCollaborationStore();

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  return (
    <header
      className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4"
      role="banner"
    >
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">CC</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              {APP_CONFIG.NAME}
            </h1>
          </div>
        </div>

        <nav className="flex items-center gap-2" aria-label="Main navigation">
          {/* Active collaborators indicator */}
          {participants.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-100 dark:bg-green-900/30">
              <Users className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden="true" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                {participants.size} {participants.size === 1 ? 'collaborator' : 'collaborators'}
              </span>
            </div>
          )}

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Moon className="h-5 w-5" aria-hidden="true" />
            )}
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="h-5 w-5" aria-hidden="true" />
          </Button>

          {/* User menu */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={`${user.name}'s avatar`}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:inline">
                  {user.name}
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                aria-label="Logout"
                title="Logout"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
