import React, { useState, useEffect } from 'react';
import { Activity, Bell } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { dbGetActivityLogs } from '../../services/database';
import { ActivityLogItem } from '../../types';
import { useTranslation } from '../../features/i18n/context';

export const NotificationsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    async function load() {
      const data = await dbGetActivityLogs(currentUser!.uid);
      setLogs(data);
    }
    load();
  }, [currentUser]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">{t('nav.notifications')}</h1>
        <p className="text-xs text-slate-600">Audit timeline of vehicle changes, assessment drafts, and reviewer updates.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {logs.length === 0 ? (
          <div className="text-center py-8 space-y-2 text-xs text-slate-500">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No activity logs recorded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="py-3 flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{log.title}</h4>
                  <p className="text-xs text-slate-600">{log.description}</p>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
