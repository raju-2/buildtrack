import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Input, Button } from '../components/ui.jsx';
import AuthLayout from '../components/AuthLayout.jsx';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      toast.success(data.message);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={t('forgot_password_title')} subtitle={t('forgot_password_subtitle')}>
      {sent ? (
        <p className="text-center text-sm text-gray-600 dark:text-gray-300">
          If an account exists for <strong>{email}</strong>, a reset link has been sent. Please check your inbox.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={t('email')} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('sending') : t('send_reset_link')}
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <Link to="/login" className="font-medium text-primary-600 hover:underline">
          {t('back_to_login')}
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPassword;
