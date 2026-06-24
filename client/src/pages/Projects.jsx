import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiShare2 } from 'react-icons/fi';
import api from '../services/api';
import { useProjects } from '../context/ProjectContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Card, Button, Input, Modal } from '../components/ui.jsx';
import Loader from '../components/Loader.jsx';

const emptyForm = { name: '', address: '', startDate: '', expectedCompletionDate: '', totalBudget: '' };

const Projects = () => {
  const { projects, fetchProjects, loading } = useProjects();
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [shareModal, setShareModal] = useState(null);
  const [shareEmail, setShareEmail] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (project) => {
    setEditing(project);
    setForm({
      name: project.name,
      address: project.address,
      startDate: project.startDate?.slice(0, 10),
      expectedCompletionDate: project.expectedCompletionDate?.slice(0, 10) || '',
      totalBudget: project.totalBudget,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/projects/${editing._id}`, form);
        toast.success('Project updated');
      } else {
        await api.post('/projects', form);
        toast.success('Project created');
      }
      setModalOpen(false);
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('delete_project_confirm'))) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${shareModal._id}/share`, { email: shareEmail, permission: 'view' });
      toast.success(`Shared with ${shareEmail}`);
      setShareModal(null);
      setShareEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to share');
    }
  };

  if (loading) return <Loader full />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('projects_title')}</h1>
        <Button onClick={openCreate}>
          <FiPlus /> {t('new_project')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 && (
          <p className="col-span-full text-center text-gray-500 dark:text-gray-400">
            {t('no_projects_msg')}
          </p>
        )}
        {projects.map((p) => (
          <Card key={p._id} className="flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold">{p.name}</h3>
              <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-700 dark:bg-primary-900 dark:text-primary-200">
                {p.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{p.address}</p>
            <p className="text-sm">
              {t('budget')}: <span className="font-medium">₹{p.totalBudget.toLocaleString('en-IN')}</span>
            </p>
            <p className="text-xs text-gray-400">
              {t('start_date')}: {new Date(p.startDate).toLocaleDateString()}
              {p.expectedCompletionDate && ` · ${t('expected_completion')}: ${new Date(p.expectedCompletionDate).toLocaleDateString()}`}
            </p>
            <div className="mt-2 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => openEdit(p)}>
                <FiEdit2 size={14} /> {t('edit')}
              </Button>
              <Button variant="outline" onClick={() => setShareModal(p)}>
                <FiShare2 size={14} />
              </Button>
              <Button variant="danger" onClick={() => handleDelete(p._id)}>
                <FiTrash2 size={14} />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? t('edit_project') : t('new_project')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={t('project_name')} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label={t('address')} required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('start_date')}
              type="date"
              required
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
            <Input
              label={t('expected_completion')}
              type="date"
              value={form.expectedCompletionDate}
              onChange={(e) => setForm({ ...form, expectedCompletionDate: e.target.value })}
            />
          </div>
          <Input
            label={`${t('budget')} (₹)`}
            type="number"
            min="0"
            required
            value={form.totalBudget}
            onChange={(e) => setForm({ ...form, totalBudget: e.target.value })}
          />
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? t('saving') : editing ? t('update_project') : t('create_project')}
          </Button>
        </form>
      </Modal>

      <Modal open={!!shareModal} onClose={() => setShareModal(null)} title={`${t('share')}: "${shareModal?.name}"`}>
        <form onSubmit={handleShare} className="space-y-4">
          <Input
            label={t('family_member_email')}
            type="email"
            required
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            placeholder={t('family_email_hint')}
          />
          <Button type="submit" className="w-full">
            {t('share_access')}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
