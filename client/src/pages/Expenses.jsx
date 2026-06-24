import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import api from '../services/api';
import { useProjects } from '../context/ProjectContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Card, Button, Input, Select, Modal } from '../components/ui.jsx';
import Loader from '../components/Loader.jsx';

const CATEGORIES = ['Cement', 'Steel', 'Bricks', 'Sand', 'Electrical', 'Plumbing', 'Interior', 'Labor', 'Miscellaneous'];

const emptyForm = { title: '', amount: '', category: 'Cement', date: '', description: '' };

const Expenses = () => {
  const { selectedProject } = useProjects();
  const { t } = useLanguage();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', from: '', to: '', search: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [billFile, setBillFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchExpenses = async () => {
    if (!selectedProject) {
      setExpenses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = { project: selectedProject, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await api.get('/expenses', { params });
      setExpenses(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedProject, filters]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, date: new Date().toISOString().slice(0, 10) });
    setBillFile(null);
    setModalOpen(true);
  };

  const openEdit = (exp) => {
    setEditing(exp);
    setForm({
      title: exp.title,
      amount: exp.amount,
      category: exp.category,
      date: exp.date.slice(0, 10),
      description: exp.description || '',
    });
    setBillFile(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('project', selectedProject);
      Object.entries(form).forEach(([k, v]) => payload.append(k, v));
      if (billFile) payload.append('billImage', billFile);

      if (editing) {
        await api.put(`/expenses/${editing._id}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Expense updated');
      } else {
        await api.post('/expenses', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Expense added');
      }
      setModalOpen(false);
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('delete_expense_confirm'))) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success('Expense deleted');
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (!selectedProject) {
    return <p className="text-center text-gray-500 dark:text-gray-400">{t('select_or_create_project')}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('expenses_title')}</h1>
        <Button onClick={openCreate}>
          <FiPlus /> {t('add_expense')}
        </Button>
      </div>

      <Card>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="relative sm:col-span-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder={t('search_expenses')}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-primary-500 dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <Select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
            <option value="">{t('all_categories')}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} placeholder={t('from')} />
          <Input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} placeholder={t('to')} />
        </div>
      </Card>

      <Card>
        {loading ? (
          <Loader />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="pb-2">{t('date')}</th>
                  <th className="pb-2">{t('title_label')}</th>
                  <th className="pb-2">{t('category')}</th>
                  <th className="pb-2">{t('bill')}</th>
                  <th className="pb-2 text-right">{t('amount')}</th>
                  <th className="pb-2 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-400">
                      {t('no_expenses_found')}
                    </td>
                  </tr>
                )}
                {expenses.map((exp) => (
                  <tr key={exp._id} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="py-2">{new Date(exp.date).toLocaleDateString()}</td>
                    <td className="py-2">
                      {exp.title}
                      {exp.description && <p className="text-xs text-gray-400">{exp.description}</p>}
                    </td>
                    <td className="py-2">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">{exp.category}</span>
                    </td>
                    <td className="py-2">
                      {exp.billImage ? (
                        <a
                          href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${exp.billImage}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary-600 hover:underline"
                        >
                          {t('view')}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-2 text-right font-medium">₹{exp.amount.toLocaleString('en-IN')}</td>
                    <td className="py-2 text-right">
                      <button onClick={() => openEdit(exp)} className="mr-2 text-gray-500 hover:text-primary-600">
                        <FiEdit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(exp._id)} className="text-gray-500 hover:text-red-600">
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? t('edit_expense') : t('add_expense')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={t('title_label')} required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={`${t('amount')} (₹)`}
              type="number"
              min="0"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            <Input label={t('date')} type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <Select label={t('category')} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Input
            label={t('description_optional')}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('bill_image_optional')}</label>
            <input type="file" accept="image/*,.pdf" onChange={(e) => setBillFile(e.target.files[0])} className="text-sm" />
          </div>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? t('saving') : editing ? t('update_expense') : t('add_expense')}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default Expenses;
