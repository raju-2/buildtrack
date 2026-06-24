import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiFolder,
  FiDollarSign,
  FiUsers,
  FiCreditCard,
  FiBarChart2,
  FiBell,
  FiShield,
  FiX,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

const navItems = [
  { to: '/dashboard', key: 'nav_dashboard', icon: FiHome },
  { to: '/projects', key: 'nav_projects', icon: FiFolder },
  { to: '/expenses', key: 'nav_expenses', icon: FiDollarSign },
  { to: '/workers', key: 'nav_workers', icon: FiUsers },
  { to: '/payments', key: 'nav_payments', icon: FiCreditCard },
  { to: '/reports', key: 'nav_reports', icon: FiBarChart2 },
  { to: '/notifications', key: 'nav_notifications', icon: FiBell },
];

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed z-40 h-full w-64 transform border-r border-gray-200 bg-white p-4 transition-transform duration-200 dark:border-gray-800 dark:bg-gray-900 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-8 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 font-bold text-white">
              BT
            </div>
            <span className="text-lg font-bold">{t('appName')}</span>
          </div>
          <button onClick={onClose} className="lg:hidden">
            <FiX size={22} />
          </button>
        </div>

        <nav className="space-y-1">
          {navItems.map(({ to, key, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`
              }
            >
              <Icon size={18} />
              {t(key)}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`
              }
            >
              <FiShield size={18} />
              {t('nav_admin')}
            </NavLink>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
