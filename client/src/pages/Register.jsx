import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Input, Button } from '../components/ui.jsx';
import AuthLayout from '../components/AuthLayout.jsx';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      toast.success(data.message);
      navigate('/verify-otp', { state: { email: form.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={t('create_account')} subtitle={t('register_subtitle')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label={t('full_name')} name="name" required value={form.name} onChange={handleChange} placeholder="John Doe" />
        <Input label={t('email')} type="email" name="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" />
        <Input
          label={t('password')}
          type="password"
          name="password"
          required
          minLength={6}
          value={form.password}
          onChange={handleChange}
          placeholder="At least 6 characters"
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t('creating_account') : t('sign_up_btn')}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        {t('already_have_account')}{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:underline">
          {t('log_in')}
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
