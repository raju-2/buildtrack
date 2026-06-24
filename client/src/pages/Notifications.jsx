import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiBell, FiCheckCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Card, Button } from '../components/ui.jsx';
import Loader from '../components/Loader.jsx';

const iconFor = (type) => {
  if (type === 'budget-exceeded') return <FiAlertTriangle className="text-red-500" />;
  if (type === 'budget-warning') return <FiAlertTriangle className="text-yellow-500" />;
  if (type === 'payment-due') return <FiBell className="text-orange-500" />;
  return <FiInfo className="text-primary-500" />;
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    fetchNotifications();
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    toast.success('All notifications marked as read');
    fetchNotifications();
  };

  if (loading) return <Loader full />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('notifications_title')}</h1>
        <Button variant="outline" onClick={markAllRead}>
          {t('mark_all_read')}
        </Button>
      </div>

      <Card>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {notifications.length === 0 && <p className="py-8 text-center text-gray-400">{t('all_caught_up')}</p>}
          {notifications.map((n) => (
            <div key={n._id} className={`flex items-start justify-between gap-3 py-3 ${n.isRead ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{iconFor(n.type)}</div>
                <div>
                  <p className="text-sm">{n.message}</p>
                  <p className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              </div>
              {!n.isRead && (
                <button onClick={() => markRead(n._id)} className="text-gray-400 hover:text-primary-600" title="Mark as read">
                  <FiCheckCircle size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Notifications;
