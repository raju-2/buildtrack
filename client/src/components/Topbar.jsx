import React from 'react';
import { FiMenu, FiMoon, FiSun, FiLogOut, FiGlobe } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import toast from 'react-hot-toast';

const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
      <button onClick={onMenuClick} className="lg:hidden">
        <FiMenu size={22} />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          title={t('language')}
        >
          <FiGlobe size={16} />
          {language === 'en' ? 'తె' : 'EN'}
        </button>

        <button
          onClick={toggleTheme}
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          title={t('toggle_theme')}
        >
          {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
        </button>

        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold">{user?.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700 dark:bg-primary-800 dark:text-primary-100">
          {user?.name?.charAt(0).toUpperCase()}
        </div>

        <button
          onClick={handleLogout}
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          title={t('logout')}
        >
          <FiLogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
