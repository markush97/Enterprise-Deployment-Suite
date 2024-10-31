import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';

export function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  return (
    <button
      onClick={toggleDarkMode}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      style={{
        backgroundColor: isDarkMode ? '#3b82f6' : '#e5e7eb'
      }}
    >
      <span className="sr-only">Toggle dark mode</span>
      <span
        className={`${
          isDarkMode ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
      >
        {isDarkMode ? (
          <Moon className="h-4 w-4 text-blue-600" />
        ) : (
          <Sun className="h-4 w-4 text-yellow-500" />
        )}
      </span>
    </button>
  );
}