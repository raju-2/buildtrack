import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import VerifyOtp from './pages/VerifyOtp.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

import Dashboard from './pages/Dashboard.jsx';
import Projects from './pages/Projects.jsx';
import Expenses from './pages/Expenses.jsx';
import Workers from './pages/Workers.jsx';
import Payments from './pages/Payments.jsx';
import Reports from './pages/Reports.jsx';
import Notifications from './pages/Notifications.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import NotFound from './pages/NotFound.jsx';

const withLayout = (Component, adminOnly = false) => (
  <ProtectedRoute adminOnly={adminOnly}>
    <DashboardLayout>
      <Component />
    </DashboardLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Public auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Protected app routes */}
      <Route path="/dashboard" element={withLayout(Dashboard)} />
      <Route path="/projects" element={withLayout(Projects)} />
      <Route path="/expenses" element={withLayout(Expenses)} />
      <Route path="/workers" element={withLayout(Workers)} />
      <Route path="/payments" element={withLayout(Payments)} />
      <Route path="/reports" element={withLayout(Reports)} />
      <Route path="/notifications" element={withLayout(Notifications)} />
      <Route path="/admin" element={withLayout(AdminPanel, true)} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
