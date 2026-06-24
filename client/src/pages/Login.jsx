import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Input, Button } from '../components/ui.jsx';
import AuthLayout from '../components/AuthLayout.jsx';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      toast.success(t('welcome_toast'));
      navigate('/dashboard');
    } catch (err) {
      const res = err.response?.data;
      if (res?.requiresVerification) {
        toast.error('Please verify your email first');
        navigate('/verify-otp', { state: { email: form.email } });
      } else {
        toast.error(res?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={t('welcome_back')} subtitle={t('login_subtitle')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label={t('email')} type="email" name="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" />
        <Input label={t('password')} type="password" name="password" required value={form.password} onChange={handleChange} placeholder="••••••••" />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">
            {t('forgot_password')}
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t('logging_in') : t('log_in_btn')}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        {t('dont_have_account')}{' '}
        <Link to="/register" className="font-medium text-primary-600 hover:underline">
          {t('sign_up')}
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
