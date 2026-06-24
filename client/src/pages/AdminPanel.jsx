import React, { useEffect, useState } from 'react';
import { FiUsers, FiFolder, FiDollarSign, FiList } from 'react-icons/fi';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Card, StatCard } from '../components/ui.jsx';
import Loader from '../components/Loader.jsx';

const AdminPanel = () => {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    Promise.all([api.get('/admin/overview'), api.get('/admin/users'), api.get('/admin/projects')])
      .then(([o, u, p]) => {
        setOverview(o.data.data);
        setUsers(u.data.data);
        setProjects(p.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader full />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('admin_panel')}</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t('total_users')} value={overview.userCount} icon={<FiUsers />} />
        <StatCard title={t('total_projects')} value={overview.projectCount} icon={<FiFolder />} accent="yellow" />
        <StatCard title={t('total_expenses')} value={overview.expenseCount} icon={<FiList />} accent="green" />
        <StatCard
          title={t('platform_spend')}
          value={`₹${overview.totalSpendAcrossPlatform.toLocaleString('en-IN')}`}
          icon={<FiDollarSign />}
          accent="red"
        />
      </div>

      <Card>
        <h3 className="mb-4 font-semibold">{t('all_users')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-gray-500 dark:text-gray-400">
              <tr>
                <th className="pb-2">{t('name')}</th>
                <th className="pb-2">{t('email')}</th>
                <th className="pb-2">{t('role')}</th>
                <th className="pb-2">{t('verified')}</th>
                <th className="pb-2">{t('joined')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="py-2">{u.name}</td>
                  <td className="py-2">{u.email}</td>
                  <td className="py-2 capitalize">{u.role}</td>
                  <td className="py-2">{u.isVerified ? '✅' : '❌'}</td>
                  <td className="py-2">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 font-semibold">{t('all_projects')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-gray-500 dark:text-gray-400">
              <tr>
                <th className="pb-2">{t('projects_title')}</th>
                <th className="pb-2">{t('owner')}</th>
                <th className="pb-2">{t('budget')}</th>
                <th className="pb-2">{t('status')}</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p._id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="py-2">{p.name}</td>
                  <td className="py-2">{p.owner?.email}</td>
                  <td className="py-2">₹{p.totalBudget.toLocaleString('en-IN')}</td>
                  <td className="py-2 capitalize">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminPanel;
