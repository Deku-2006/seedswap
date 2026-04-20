'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sprout, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/context/authStore';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', location: '' });
  const { login, register, loading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        if (!form.name.trim()) return toast.error('Name is required');
        await register(form.name, form.email, form.password, form.location);
        toast.success('Account created! Welcome to SeedSwap 🌱');
      }
      router.push('/browse');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f6f9f4]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
            <Sprout className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-sage-900">SeedSwap</h1>
          <p className="text-sage-500 text-sm mt-1">
            {mode === 'login' ? 'Welcome back! Sign in to continue.' : 'Join our seed sharing community.'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-sage-100 shadow-sm p-8">
          <h2 className="font-display text-xl font-semibold text-sage-900 mb-6">
            {mode === 'login' ? 'Login' : 'Create Account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Jane Green"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1.5">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-medium text-sage-700">Password</label>
                {mode === 'login' && (
                  <button type="button" className="text-xs text-brand-600 hover:text-brand-700">
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-1.5">
                  Location <span className="text-sage-400">(optional)</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., Chennai, India"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-sage-500 mt-5">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-brand-600 font-medium hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
