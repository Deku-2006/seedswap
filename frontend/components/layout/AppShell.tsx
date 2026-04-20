'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutGrid, Sprout, PlusCircle, MessageSquare, Sparkles,
  Globe, LogIn, LogOut, ChevronDown, Menu, X,
} from 'lucide-react';
import { useAuthStore } from '@/context/authStore';
import { useTranslation } from '@/context/TranslationContext';
import { cn, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';

const LANGUAGES = [
  { code: 'en',    label: 'English' },
  { code: 'hi',    label: 'हिन्दी' },
  { code: 'bn',    label: 'বাংলা' },
  { code: 'ta',    label: 'தமிழ்' },
  { code: 'ml',    label: 'മലയാളം' },
  { code: 'te',    label: 'తెలుగు' },
  { code: 'kn',    label: 'ಕನ್ನಡ' },
  { code: 'mr',    label: 'मराठी' },
  { code: 'fr',    label: 'Français' },
  { code: 'es',    label: 'Español' },
  { code: 'de',    label: 'Deutsch' },
  { code: 'zh',    label: '中文' },
  { code: 'ar',    label: 'العربية' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout, initialize, initialized } = useAuthStore();
  const { t, langLabel, setLanguage, isTranslating } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { initialize(); }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/browse');
  };

  const handleLangChange = (code: string, label: string) => {
    setLanguage(code, label);
    setLangOpen(false);
  };

  const NAV = [
    { href: '/browse',       label: t('browse'),      icon: LayoutGrid },
    { href: '/listings/my',  label: t('myListings'),  icon: Sprout },
    { href: '/listings/new', label: t('addListing'),  icon: PlusCircle },
    { href: '/chat',         label: t('chat'),         icon: MessageSquare },
    { href: '/ai-assistant', label: t('aiAssistant'), icon: Sparkles },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <Link href="/browse" className="flex items-center gap-2.5 px-5 py-5 mb-2">
        <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center shadow-sm">
          <Sprout className="w-4 h-4 text-white" />
        </div>
        <span className="font-display font-semibold text-xl text-sage-900">SeedSwap</span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={cn('sidebar-link', pathname.startsWith(href) && 'active')}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-2 mt-4 border-t border-sage-100 pt-4">
        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="sidebar-link w-full justify-between"
          >
            <span className="flex items-center gap-3">
              <Globe className="w-4 h-4" />
              {isTranslating ? (
                <span className="flex items-center gap-1.5 text-brand-600">
                  <span className="w-3 h-3 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                  {t('translating')}
                </span>
              ) : langLabel}
            </span>
            <ChevronDown className={cn('w-4 h-4 transition-transform', langOpen && 'rotate-180')} />
          </button>

          {langOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-sage-200 rounded-xl shadow-lg overflow-hidden z-50 max-h-64 overflow-y-auto">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => handleLangChange(l.code, l.label)}
                  className={cn(
                    'w-full text-left px-4 py-2.5 text-sm hover:bg-sage-50 transition-colors flex items-center gap-2',
                    langLabel === l.label && 'text-brand-600 font-medium bg-brand-50'
                  )}
                >
                  {langLabel === l.label && <span>✓</span>}
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Auth */}
        {user ? (
          <div className="space-y-1">
            <Link href="/profile" className="sidebar-link" onClick={() => setMobileOpen(false)}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-medium">
                  {getInitials(user.name)}
                </div>
              )}
              <span className="truncate">{user.name}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="sidebar-link w-full text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              {t('signOut')}
            </button>
          </div>
        ) : (
          <Link
            href="/auth"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 w-full bg-brand-500 hover:bg-brand-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          >
            <LogIn className="w-4 h-4" />
            {t('login')}
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f6f9f4]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-sage-100 fixed left-0 top-0 bottom-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-sage-100 px-4 py-3 flex items-center justify-between">
        <Link href="/browse" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center">
            <Sprout className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display font-semibold text-lg text-sage-900">SeedSwap</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-sage-50">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 md:ml-64 pt-14 md:pt-0 min-h-screen">
        <div className="page-enter">
          {initialized ? children : (
            <div className="flex items-center justify-center h-screen">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
