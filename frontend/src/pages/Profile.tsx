import { useState, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../api/authApi';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNew, setConfirmNew] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState('');

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await authApi.updateProfile({ fullName });
      await refreshProfile();
      setMessage('Profile updated successfully');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNew) { setPwMessage('Passwords do not match'); return; }
    setPwLoading(true);
    setPwMessage('');
    try {
      await authApi.changePassword({ currentPassword, newPassword, confirmNewPassword: confirmNew });
      setPwMessage('Password changed successfully');
      setCurrentPassword(''); setNewPassword(''); setConfirmNew('');
    } catch (err: any) {
      setPwMessage(err.response?.data?.message || 'Change password failed');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Profile & Settings</h2>

      {/* Profile Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Profile Information</h3>
        {message && <div className="mb-4 p-3 bg-indigo-50 text-indigo-700 rounded-lg text-sm">{message}</div>}
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <Input label="Email" value={user?.email || ''} disabled />
          <div className="text-sm text-slate-500">
            Roles: {user?.roles?.join(', ')} | Member since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
          </div>
          <Button type="submit" loading={loading}>Update Profile</Button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Change Password</h3>
        {pwMessage && <div className="mb-4 p-3 bg-indigo-50 text-indigo-700 rounded-lg text-sm">{pwMessage}</div>}
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <Input label="Confirm New Password" type="password" value={confirmNew} onChange={(e) => setConfirmNew(e.target.value)} required />
          <Button type="submit" loading={pwLoading}>Change Password</Button>
        </form>
      </div>
    </div>
  );
}
