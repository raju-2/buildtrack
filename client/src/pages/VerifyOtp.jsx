import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Input, Button } from '../components/ui.jsx';
import AuthLayout from '../components/AuthLayout.jsx';

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      login(data.token, data.user);
      toast.success(t('verified_toast'));
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return toast.error('Enter your email first');
    setResending(true);
    try {
      const { data } = await api.post('/auth/resend-otp', { email });
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout title={t('verify_email')} subtitle={t('verify_subtitle')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label={t('email')} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input
          label={t('otp_code')}
          required
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="123456"
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t('verifying') : t('verify_account_btn')}
        </Button>
      </form>
      <button
        onClick={handleResend}
        disabled={resending}
        className="mt-4 w-full text-center text-sm font-medium text-primary-600 hover:underline"
      >
        {resending ? t('resending') : t('resend_otp')}
      </button>
    </AuthLayout>
  );
};

export default VerifyOtp;
