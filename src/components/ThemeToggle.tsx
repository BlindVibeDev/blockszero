import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Laptop } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme, isDark } = useTheme();

  return (
    <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1">
      <button
        className={`p-1.5 rounded-full ${theme === 'light' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' : 'text-gray-600 dark:text-gray-400'}`}
        onClick={() => setTheme('light')}
        title="Light mode"
      >
        <Sun size={14} />
      </button>
      <button
        className={`p-1.5 rounded-full ${theme === 'dark' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' : 'text-gray-600 dark:text-gray-400'}`}
        onClick={() => setTheme('dark')}
        title="Dark mode"
      >
        <Moon size={14} />
      </button>
      <button
        className={`p-1.5 rounded-full ${theme === 'system' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' : 'text-gray-600 dark:text-gray-400'}`}
        onClick={() => setTheme('system')}
        title="System preference"
      >
        <Laptop size={14} />
      </button>
    </div>
  );
};

export default ThemeToggle;