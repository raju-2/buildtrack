import React, { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiUsers, FiList } from 'react-icons/fi';
import api from '../services/api';
import { useProjects } from '../context/ProjectContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Card, StatCard } from '../components/ui.jsx';
import Loader from '../components/Loader.jsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const CATEGORY_COLORS = [
  '#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1',
];

const Dashboard = () => {
  const { selectedProject } = useProjects();
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedProject) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get('/dashboard', { params: { project: selectedProject } })
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, [selectedProject]);

  if (loading) return <Loader full />;

  if (!data) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        {t('create_project_first')}
      </div>
    );
  }

  const barData = {
    labels: data.monthlyExpenses.map((m) => m.month),
    datasets: [
      {
        label: 'Monthly Expenses (₹)',
        data: data.monthlyExpenses.map((m) => m.total),
        backgroundColor: '#3b82f6',
        borderRadius: 6,
      },
    ],
  };

  const doughnutData = {
    labels: data.categoryWiseSpending.map((c) => c.category),
    datasets: [
      {
        data: data.categoryWiseSpending.map((c) => c.total),
        backgroundColor: CATEGORY_COLORS,
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('dashboard_overview')}</h1>

      {data.budgetUsedPercent >= 80 && (
        <div className={`rounded-lg p-3 text-sm font-medium ${data.budgetUsedPercent >= 100 ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'}`}>
          {data.budgetUsedPercent >= 100
            ? `⚠️ You have exceeded your budget by ${(data.budgetUsedPercent - 100).toFixed(1)}%!`
            : `⚠️ You've used ${data.budgetUsedPercent}% of your total budget.`}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title={t('total_budget')} value={fmt(data.totalBudget)} icon={<FiDollarSign />} accent="primary" />
        <StatCard title={t('total_spent')} value={fmt(data.totalSpent)} icon={<FiTrendingUp />} accent="red" />
        <StatCard title={t('remaining')} value={fmt(data.remainingBudget)} icon={<FiTrendingDown />} accent="green" />
        <StatCard title={t('workers_count')} value={data.workerCount} icon={<FiUsers />} accent="yellow" />
        <StatCard title={t('expenses_count')} value={data.expenseCount} icon={<FiList />} accent="primary" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold">{t('monthly_expenses')}</h3>
          {data.monthlyExpenses.length ? <Bar data={barData} /> : <p className="text-sm text-gray-500">{t('no_expense_data')}</p>}
        </Card>
        <Card>
          <h3 className="mb-4 font-semibold">{t('category_spending')}</h3>
          {data.categoryWiseSpending.length ? (
            <Doughnut data={doughnutData} />
          ) : (
            <p className="text-sm text-gray-500">{t('no_expense_data')}</p>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 font-semibold">{t('recent_transactions')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-gray-500 dark:text-gray-400">
              <tr>
                <th className="pb-2">{t('date')}</th>
                <th className="pb-2">{t('title_label')}</th>
                <th className="pb-2">{t('category')}</th>
                <th className="pb-2 text-right">{t('amount')}</th>
              </tr>
            </thead>
            <tbody>
              {data.recentTransactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-400">
                    {t('no_transactions')}
                  </td>
                </tr>
              )}
              {data.recentTransactions.map((t2) => (
                <tr key={t2._id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="py-2">{new Date(t2.date).toLocaleDateString()}</td>
                  <td className="py-2">{t2.title}</td>
                  <td className="py-2">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">{t2.category}</span>
                  </td>
                  <td className="py-2 text-right font-medium">{fmt(t2.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
