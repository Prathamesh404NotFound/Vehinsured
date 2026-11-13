import React, { useState } from 'react';
import { User, Save, Globe } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { useTranslation } from '../../features/i18n/context';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SupportedLanguage } from '../../types';

export const ProfilePage: React.FC = () => {
  const { currentUser, updateProfileData } = useAuth();
  const { language, setLanguage, t } = useTranslation();

  const [name, setName] = useState(currentUser?.displayName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProfileData({ displayName: name, phone });
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">{t('nav.profile')}</h1>
        <p className="text-xs text-slate-600">Update personal profile information and preferred application language.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold">
            Profile settings updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Email Address"
            value={currentUser?.email || ''}
            disabled
            helperText="Email is managed via authentication session."
          />

          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Mobile Phone (Optional)"
            placeholder="+91 9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Preferred Application Language</span>
            </label>
            <select
              value={language}
              onChange={(e) => {
                const lang = e.target.value as SupportedLanguage;
                setLanguage(lang);
                updateProfileData({ language: lang });
              }}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm bg-white"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="mr">मराठी (Marathi)</option>
            </select>
          </div>

          <Button type="submit" isLoading={saving} className="gap-2">
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </Button>
        </form>
      </div>
    </div>
  );
};
