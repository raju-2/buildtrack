import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiTrash2 } from 'react-icons/fi';
import api from '../services/api';
import { useProjects } from '../context/ProjectContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Card } from '../components/ui.jsx';
import Loader from '../components/Loader.jsx';

const Payments = () => {
  const { selectedProject } = useProjects();
  const { t } = useLanguage();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    if (!selectedProject) {
      setPayments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/payments', { params: { project: selectedProject } });
      setPayments(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [selectedProject]);

  const handleDelete = async (id) => {
    if (!window.confirm(t('delete_payment_confirm'))) return;
    try {
      await api.delete(`/payments/${id}`);
      toast.success('Payment deleted');
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (!selectedProject) {
    return <p className="text-center text-gray-500 dark:text-gray-400">{t('select_or_create_project')}</p>;
  }

  const total = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('payments_title')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('total_paid')}: <span className="font-semibold text-green-600">₹{total.toLocaleString('en-IN')}</span>
        </p>
      </div>

      <Card>
        {loading ? (
          <Loader />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="pb-2">{t('date')}</th>
                  <th className="pb-2">{t('worker')}</th>
                  <th className="pb-2">{t('role')}</th>
                  <th className="pb-2">{t('mode')}</th>
                  <th className="pb-2">{t('note')}</th>
                  <th className="pb-2 text-right">{t('amount')}</th>
                  <th className="pb-2 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-gray-400">
                      {t('no_payments_msg')}
                    </td>
                  </tr>
                )}
                {payments.map((p) => (
                  <tr key={p._id} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="py-2">{new Date(p.date).toLocaleDateString()}</td>
                    <td className="py-2">{p.worker?.name}</td>
                    <td className="py-2">{p.worker?.role}</td>
                    <td className="py-2 capitalize">{p.mode}</td>
                    <td className="py-2">{p.note || '—'}</td>
                    <td className="py-2 text-right font-medium">₹{p.amount.toLocaleString('en-IN')}</td>
                    <td className="py-2 text-right">
                      <button onClick={() => handleDelete(p._id)} className="text-gray-500 hover:text-red-600">
                        <FiTrash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Payments;
