'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, MapPin, Save } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/context/authStore';
import { getInitials, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', bio: '' });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.push('/auth'); return; }
    setForm({ name: user.name, location: user.location || '', bio: user.bio || '' });
  }, [user]);

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('location', form.location);
      fd.append('bio', form.bio);
      if (fileRef.current?.files?.[0]) fd.append('avatar', fileRef.current.files[0]);
      const res = await api.put('/auth/profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const avatar = avatarPreview || user.avatar;

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-sage-900">My Profile</h1>
        <p className="text-sage-500 text-sm mt-1">Member since {formatDate(user.createdAt)}</p>
      </div>

      <div className="bg-white rounded-2xl border border-sage-100 p-8">
        {/* Avatar */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {avatar ? (
              <img src={avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover ring-4 ring-brand-100" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-2xl font-display font-semibold ring-4 ring-brand-50">
                {getInitials(user.name)}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-brand-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-brand-600 transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-1.5">Display Name</label>
            <input type="text" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-sage-700 mb-1.5">Email</label>
            <input type="email" className="input-field opacity-60" value={user.email} disabled />
            <p className="text-xs text-sage-400 mt-1">Email cannot be changed.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-sage-700 mb-1.5">
              <MapPin className="w-3.5 h-3.5 inline mr-1" />Location
            </label>
            <input type="text" className="input-field" placeholder="e.g., Chennai, India" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium text-sage-700 mb-1.5">Bio</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="Tell the community about your gardening interests..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              maxLength={200}
            />
            <p className="text-xs text-sage-400 mt-1">{form.bio.length}/200</p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
