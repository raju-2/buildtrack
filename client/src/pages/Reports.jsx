import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import { FiDownload, FiFileText } from 'react-icons/fi';
import api, { API_BASE_URL } from '../services/api';
import { useProjects } from '../context/ProjectContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Card, Button } from '../components/ui.jsx';
import Loader from '../components/Loader.jsx';

const Reports = () => {
  const { selectedProject, projects } = useProjects();
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
      .get('/reports/analytics', { params: { project: selectedProject } })
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, [selectedProject]);

  const downloadFile = async (type) => {
    try {
      const token = localStorage.getItem('buildtrack_token');
      const url = `${API_BASE_URL}/reports/${type}?project=${selectedProject}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      const projectName = projects.find((p) => p._id === selectedProject)?.name || 'report';
      link.download = `${projectName}-report.${type === 'pdf' ? 'pdf' : 'xlsx'}`;
      link.click();
    } catch (err) {
      toast.error('Failed to download report');
    }
  };

  if (!selectedProject) {
    return <p className="text-center text-gray-500 dark:text-gray-400">{t('select_or_create_project')}</p>;
  }

  if (loading) return <Loader full />;
  if (!data) return null;

  const barData = {
    labels: data.monthlyExpenses.map((m) => m.month),
    datasets: [{ label: 'Monthly Spend (₹)', data: data.monthlyExpenses.map((m) => m.total), backgroundColor: '#3b82f6', borderRadius: 6 }],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('reports_title')}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => downloadFile('pdf')}>
            <FiFileText /> {t('download_pdf')}
          </Button>
          <Button variant="outline" onClick={() => downloadFile('excel')}>
            <FiDownload /> {t('export_excel')}
          </Button>
        </div>
      </div>

      {data.predictedNextMonthSpending !== null && (
        <Card className="bg-primary-50 dark:bg-primary-900/20">
          <p className="text-sm text-gray-600 dark:text-gray-300">{t('predicted_spend')}</p>
          <p className="text-2xl font-bold text-primary-700 dark:text-primary-300">
            ₹{data.predictedNextMonthSpending.toLocaleString('en-IN')}
          </p>
        </Card>
      )}

      <Card>
        <h3 className="mb-4 font-semibold">{t('monthly_report')}</h3>
        {data.monthlyExpenses.length ? <Bar data={barData} /> : <p className="text-sm text-gray-500">{t('no_data_yet')}</p>}
      </Card>

      <Card>
        <h3 className="mb-4 font-semibold">{t('category_spending')}</h3>
        <table className="w-full text-left text-sm">
          <thead className="text-gray-500 dark:text-gray-400">
            <tr>
              <th className="pb-2">{t('category')}</th>
              <th className="pb-2 text-right">{t('total_spent')}</th>
            </tr>
          </thead>
          <tbody>
            {data.categoryWiseSpending.map((c) => (
              <tr key={c.category} className="border-t border-gray-100 dark:border-gray-800">
                <td className="py-2">{c.category}</td>
                <td className="py-2 text-right font-medium">₹{c.total.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <h3 className="mb-4 font-semibold">{t('worker_payment_report')}</h3>
        <table className="w-full text-left text-sm">
          <thead className="text-gray-500 dark:text-gray-400">
            <tr>
              <th className="pb-2">{t('name')}</th>
              <th className="pb-2">{t('role')}</th>
              <th className="pb-2">{t('daily_wage')}</th>
              <th className="pb-2 text-right">{t('total_paid')}</th>
            </tr>
          </thead>
          <tbody>
            {data.workerReport.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-400">
                  {t('no_workers_added')}
                </td>
              </tr>
            )}
            {data.workerReport.map((w, i) => (
              <tr key={i} className="border-t border-gray-100 dark:border-gray-800">
                <td className="py-2">{w.name}</td>
                <td className="py-2">{w.role}</td>
                <td className="py-2">₹{w.dailyWage.toLocaleString('en-IN')}</td>
                <td className="py-2 text-right font-medium">₹{w.totalPaid.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default Reports;
