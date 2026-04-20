'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Sprout } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/context/authStore';
import toast from 'react-hot-toast';

const SEED_TYPES = [
  'Vegetable', 'Fruit', 'Herb', 'Flower', 'Grain', 'Legume', 'Spice', 'Tree', 'Shrub', 'Other',
];

export default function AddListingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', seedType: '', quantity: '', swapFor: '', tags: '',
  });

  useEffect(() => {
    if (!user) router.push('/auth');
  }, [user]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB');
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.seedType || !form.quantity) {
      return toast.error('Please fill all required fields');
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      if (fileRef.current?.files?.[0]) fd.append('image', fileRef.current.files[0]);

      await api.post('/listings', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Listing created! 🌱');
      router.push('/listings/my');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [field]: e.target.value });

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-sage-900 mb-1">Add a Listing</h1>
        <p className="text-sage-500 text-sm">Share your seeds with the community.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium text-sage-700 mb-1.5">Seed Photo</label>
          <div
            onClick={() => fileRef.current?.click()}
            className="relative border-2 border-dashed border-sage-200 rounded-2xl p-6 cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-all text-center"
          >
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-xl object-cover" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setImagePreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 text-sage-400 mx-auto" />
                <p className="text-sage-500 text-sm">Click to upload an image</p>
                <p className="text-sage-400 text-xs">PNG, JPG up to 5MB</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-sage-700 mb-1.5">Title *</label>
          <input type="text" className="input-field" placeholder="e.g., Heirloom Tomato Seeds" value={form.title} onChange={f('title')} required />
        </div>

        {/* Seed type */}
        <div>
          <label className="block text-sm font-medium text-sage-700 mb-1.5">Seed Type *</label>
          <select className="input-field" value={form.seedType} onChange={f('seedType')} required>
            <option value="">Select a type...</option>
            {SEED_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-sage-700 mb-1.5">Description *</label>
          <textarea
            className="input-field resize-none"
            rows={4}
            placeholder="Describe your seeds – variety, growing conditions, harvest info..."
            value={form.description}
            onChange={f('description')}
            required
          />
        </div>

        {/* Quantity & Swap */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-1.5">Quantity *</label>
            <input type="text" className="input-field" placeholder="e.g., 50 seeds, 100g" value={form.quantity} onChange={f('quantity')} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-1.5">Swap For</label>
            <input type="text" className="input-field" placeholder="e.g., Basil, Chili" value={form.swapFor} onChange={f('swapFor')} />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-sage-700 mb-1.5">Tags <span className="text-sage-400">(comma separated)</span></label>
          <input type="text" className="input-field" placeholder="heirloom, organic, easy-grow" value={form.tags} onChange={f('tags')} />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Sprout className="w-4 h-4" />
          )}
          {loading ? 'Creating...' : 'Create Listing'}
        </button>
      </form>
    </div>
  );
}
