import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';

const NotFound = () => {
  const { t } = useLanguage();
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-gray-950">
      <h1 className="text-5xl font-bold text-primary-600">404</h1>
      <p className="text-gray-600 dark:text-gray-300">{t('page_not_found')}</p>
      <Link to="/dashboard" className="text-primary-600 hover:underline">
        {t('go_to_dashboard')}
      </Link>
    </div>
  );
};

export default NotFound;
