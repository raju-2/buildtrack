import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiCreditCard, FiPhone } from 'react-icons/fi';
import api from '../services/api';
import { useProjects } from '../context/ProjectContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Card, Button, Input, Modal } from '../components/ui.jsx';
import Loader from '../components/Loader.jsx';

const emptyForm = { name: '', phone: '', role: '', dailyWage: '' };
const emptyPayment = { amount: '', date: '', daysWorked: '', note: '', mode: 'cash' };

const Workers = () => {
  const { selectedProject } = useProjects();
  const { t } = useLanguage();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [payModal, setPayModal] = useState(null); // worker being paid
  const [payForm, setPayForm] = useState(emptyPayment);
  const [historyModal, setHistoryModal] = useState(null); // worker whose history is shown
  const [history, setHistory] = useState(null);

  const fetchWorkers = async () => {
    if (!selectedProject) {
      setWorkers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/workers', { params: { project: selectedProject } });
      setWorkers(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [selectedProject]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (w) => {
    setEditing(w);
    setForm({ name: w.name, phone: w.phone, role: w.role, dailyWage: w.dailyWage });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/workers/${editing._id}`, form);
        toast.success('Worker updated');
      } else {
        await api.post('/workers', { ...form, project: selectedProject });
        toast.success('Worker added');
      }
      setModalOpen(false);
      fetchWorkers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('delete_worker_confirm'))) return;
    try {
      await api.delete(`/workers/${id}`);
      toast.success('Worker deleted');
      fetchWorkers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const openPay = (w) => {
    setPayModal(w);
    setPayForm({ ...emptyPayment, date: new Date().toISOString().slice(0, 10) });
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payments', { ...payForm, worker: payModal._id });
      toast.success('Payment recorded');
      setPayModal(null);
      fetchWorkers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const openHistory = async (w) => {
    setHistoryModal(w);
    const { data } = await api.get(`/workers/${w._id}`);
    setHistory(data.data);
  };

  if (!selectedProject) {
    return <p className="text-center text-gray-500 dark:text-gray-400">{t('select_or_create_project')}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('workers_title')}</h1>
        <Button onClick={openCreate}>
          <FiPlus /> {t('add_worker')}
        </Button>
      </div>

      {loading ? (
        <Loader full={false} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workers.length === 0 && (
            <p className="col-span-full text-center text-gray-500 dark:text-gray-400">{t('no_workers_msg')}</p>
          )}
          {workers.map((w) => (
            <Card key={w._id} className="flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold">{w.name}</h3>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">{w.role}</span>
              </div>
              <p className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <FiPhone size={13} /> {w.phone}
              </p>
              <p className="text-sm">
                {t('daily_wage')}: <span className="font-medium">₹{w.dailyWage.toLocaleString('en-IN')}</span>
              </p>
              <p className="text-sm">
                {t('total_paid')}: <span className="font-medium text-green-600">₹{w.totalPaid.toLocaleString('en-IN')}</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button variant="outline" className="flex-1" onClick={() => openPay(w)}>
                  <FiCreditCard size={14} /> {t('pay')}
                </Button>
                <Button variant="outline" onClick={() => openHistory(w)}>
                  {t('history')}
                </Button>
                <Button variant="outline" onClick={() => openEdit(w)}>
                  <FiEdit2 size={14} />
                </Button>
                <Button variant="danger" onClick={() => handleDelete(w._id)}>
                  <FiTrash2 size={14} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Worker Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? t('edit_worker') : t('add_worker')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={t('name')} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label={t('phone_number')} required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input
            label={t('role')}
            required
            placeholder="e.g. Mason, Carpenter, Electrician"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          />
          <Input
            label={`${t('daily_wage')} (₹)`}
            type="number"
            min="0"
            required
            value={form.dailyWage}
            onChange={(e) => setForm({ ...form, dailyWage: e.target.value })}
          />
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? t('saving') : editing ? t('update_worker') : t('add_worker')}
          </Button>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal open={!!payModal} onClose={() => setPayModal(null)} title={`${t('pay')} ${payModal?.name}`}>
        <form onSubmit={handlePaySubmit} className="space-y-4">
          <Input
            label={`${t('amount')} (₹)`}
            type="number"
            min="0"
            required
            value={payForm.amount}
            onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label={t('date')} type="date" required value={payForm.date} onChange={(e) => setPayForm({ ...payForm, date: e.target.value })} />
            <Input
              label={t('days_worked')}
              type="number"
              min="0"
              value={payForm.daysWorked}
              onChange={(e) => setPayForm({ ...payForm, daysWorked: e.target.value })}
            />
          </div>
          <Input label={t('note')} value={payForm.note} onChange={(e) => setPayForm({ ...payForm, note: e.target.value })} />
          <Button type="submit" className="w-full">
            {t('record_payment')}
          </Button>
        </form>
      </Modal>

      {/* Payment History Modal */}
      <Modal open={!!historyModal} onClose={() => setHistoryModal(null)} title={`${historyModal?.name} - ${t('payment_history_of')}`}>
        {!history ? (
          <Loader />
        ) : (
          <div className="space-y-2">
            <p className="text-sm">
              {t('total_paid')}: <span className="font-semibold text-green-600">₹{history.totalPaid.toLocaleString('en-IN')}</span>
            </p>
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
              {history.payments.length === 0 && <p className="py-4 text-center text-sm text-gray-400">{t('no_payments_recorded')}</p>}
              {history.payments.map((p) => (
                <div key={p._id} className="flex justify-between py-2 text-sm">
                  <span>{new Date(p.date).toLocaleDateString()} {p.note && `· ${p.note}`}</span>
                  <span className="font-medium">₹{p.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Workers;
