'use client';
import { useState, useRef } from 'react';
import {
  Sparkles, Upload, X, Loader2, Leaf, Droplets, Sun, Clock, MapPin, Calendar, ThumbsUp, ChevronDown,
} from 'lucide-react';
import api from '@/lib/api';
import { useTranslation } from '@/context/TranslationContext';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

type Tab = 'identifier' | 'growing' | 'calendar';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const STATUS_COLORS: Record<string, string> = {
  ideal: 'bg-brand-500 text-white',
  possible: 'bg-yellow-400 text-white',
  avoid: 'bg-red-400 text-white',
  harvest: 'bg-amber-500 text-white',
};

export default function AIAssistantPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('identifier');

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-sage-900 flex items-center gap-2.5">
          <Sparkles className="w-7 h-7 text-brand-500" />
          {t('aiTitle')}
        </h1>
        <p className="text-sage-500 text-sm mt-1">{t('aiSubtitle')}</p>
      </div>

      <div className="flex bg-white border border-sage-100 rounded-xl p-1 mb-6">
        {([['identifier', t('seedIdentifier')], ['growing', t('growingTips')], ['calendar', t('plantingCalendar')]] as [Tab, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn('flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-150',
              tab === key ? 'bg-sage-900 text-white shadow-sm' : 'text-sage-500 hover:text-sage-700')}>
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-sage-100 p-6">
        {tab === 'identifier' && <SeedIdentifier />}
        {tab === 'growing'    && <GrowingTips />}
        {tab === 'calendar'   && <PlantingCalendar />}
      </div>
    </div>
  );
}

function SeedIdentifier() {
  const { t, langLabel } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) return toast.error('Image must be under 10MB');
    setFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
    setResult(null);
  };

  const handleIdentify = async () => {
    if (!file) return toast.error('Please upload an image first');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('lang', langLabel); // ← send current language
      const res = await api.post('/ai/identify-seed', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Identification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-sage-900 mb-2">{t('seedIdentifier')}</h2>
      <p className="text-sage-500 text-sm mb-5">{t('seedIdentifierDesc')}</p>

      <div onClick={() => fileRef.current?.click()}
        className="relative border-2 border-dashed border-sage-200 rounded-2xl p-8 cursor-pointer hover:border-brand-400 hover:bg-brand-50/20 transition-all text-center mb-4">
        {preview ? (
          <div className="relative inline-block">
            <img src={preview} alt="Seed" className="max-h-64 mx-auto rounded-xl object-contain" />
            <button type="button"
              onClick={(e) => { e.stopPropagation(); setPreview(null); setFile(null); setResult(null); if (fileRef.current) fileRef.current.value = ''; }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow">
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="space-y-2 py-4">
            <Upload className="w-10 h-10 text-sage-300 mx-auto" />
            <p className="text-sage-500 text-sm">{t('uploadImage')}</p>
            <p className="text-sage-400 text-xs">{t('imageLimit2')}</p>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      <button onClick={handleIdentify} disabled={!file || loading} className="btn-primary flex items-center gap-2 px-6">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Leaf className="w-4 h-4" />}
        {loading ? t('identifying') : t('identifySeed')}
      </button>

      {result && (
        <div className="mt-6 animate-slide-up space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display text-2xl font-semibold text-sage-900">{result.seedName}</h3>
              {result.scientificName && <p className="text-sage-500 text-sm italic">{result.scientificName}</p>}
            </div>
            <span className={cn('badge', result.confidence === 'high' ? 'bg-brand-100 text-brand-700' : result.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700')}>
              {result.confidence} {t('confidence')}
            </span>
          </div>
          <p className="text-sage-600 text-sm leading-relaxed">{result.description}</p>

          {result.plantingTips && Object.keys(result.plantingTips).length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { key: 'soilType', icon: Leaf, label: t('soil') },
                { key: 'sunlight', icon: Sun, label: t('sunlight') },
                { key: 'watering', icon: Droplets, label: t('watering') },
                { key: 'season', icon: Calendar, label: t('season') },
                { key: 'depth', icon: ChevronDown, label: t('depth') },
                { key: 'spacing', icon: MapPin, label: t('spacing') },
              ].filter(({ key }) => result.plantingTips[key]).map(({ key, icon: Icon, label }) => (
                <div key={key} className="bg-sage-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-sage-500 text-xs mb-1"><Icon className="w-3.5 h-3.5" /> {label}</div>
                  <p className="text-sage-800 text-sm font-medium">{result.plantingTips[key]}</p>
                </div>
              ))}
            </div>
          )}
          {result.growthTime && (
            <div className="flex items-center gap-2 text-sage-600 text-sm">
              <Clock className="w-4 h-4 text-brand-500" />
              <span><strong>{t('growthTime')}:</strong> {result.growthTime}</span>
            </div>
          )}
          {result.additionalNotes && (
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
              <p className="text-sage-700 text-sm leading-relaxed">{result.additionalNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GrowingTips() {
  const { t, langLabel } = useTranslation();
  const [form, setForm] = useState({ seedType: '', location: '', climate: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.seedType || !form.location) return toast.error('Seed type and location are required');
    setLoading(true);
    try {
      const res = await api.post('/ai/growing-recommendations', { ...form, lang: langLabel }); // ← send language
      setResult(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-sage-900 mb-4">{t('growingRecommendations')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-sage-700 mb-1.5">{t('seedType')} *</label>
          <input type="text" className="input-field" placeholder={t('seedTypePlaceholder')}
            value={form.seedType} onChange={(e) => setForm({ ...form, seedType: e.target.value })} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-1.5">{t('locationLabel')} *</label>
            <input type="text" className="input-field" placeholder={t('locationPlaceholder')}
              value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-1.5">{t('climate')} <span className="text-sage-400">({t('optional')})</span></label>
            <input type="text" className="input-field" placeholder={t('climatePlaceholder')}
              value={form.climate} onChange={(e) => setForm({ ...form, climate: e.target.value })} />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-6">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
          {loading ? t('generating') : t('getRecommendations')}
        </button>
      </form>

      {result && (
        <div className="animate-slide-up space-y-5">
          {result.overview && (
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
              <p className="text-sage-700 text-sm leading-relaxed">{result.overview}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.soilPreparation && (
              <InfoCard icon={Leaf} title={t('soil')}>
                <p><strong>Type:</strong> {result.soilPreparation.type}</p>
                {result.soilPreparation.ph && <p><strong>pH:</strong> {result.soilPreparation.ph}</p>}
                {result.soilPreparation.amendments && <p>{result.soilPreparation.amendments}</p>}
              </InfoCard>
            )}
            {result.wateringSchedule && (
              <InfoCard icon={Droplets} title={t('watering')}>
                <p>{result.wateringSchedule.frequency}</p>
                {result.wateringSchedule.amount && <p>{result.wateringSchedule.amount}</p>}
                {result.wateringSchedule.tips && <p>{result.wateringSchedule.tips}</p>}
              </InfoCard>
            )}
            {result.sunlightNeeds && (
              <InfoCard icon={Sun} title={t('sunlight')}><p>{result.sunlightNeeds}</p></InfoCard>
            )}
            {result.harvestTime && (
              <InfoCard icon={Calendar} title={t('harvest') || 'Harvest'}>
                <p>{result.harvestTime}</p>
                {result.yieldExpectation && <p>{result.yieldExpectation}</p>}
              </InfoCard>
            )}
          </div>
          {result.plantingSeason && (
            <div className="bg-white border border-sage-100 rounded-xl p-4">
              <h4 className="font-medium text-sage-800 mb-2 text-sm">{t('plantingSeason')}</h4>
              {result.plantingSeason.bestMonths?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-1">
                  <span className="text-xs text-sage-500">{t('best')}</span>
                  {result.plantingSeason.bestMonths.map((m: string) => (
                    <span key={m} className="badge bg-brand-100 text-brand-700">{m}</span>
                  ))}
                </div>
              )}
              {result.plantingSeason.avoidMonths?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs text-sage-500">{t('avoid')}</span>
                  {result.plantingSeason.avoidMonths.map((m: string) => (
                    <span key={m} className="badge bg-red-100 text-red-600">{m}</span>
                  ))}
                </div>
              )}
            </div>
          )}
          {result.tips?.length > 0 && (
            <div>
              <h4 className="font-medium text-sage-800 mb-2 text-sm">{t('proTips')}</h4>
              <ul className="space-y-1.5">
                {result.tips.map((tip: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-sage-600">
                    <span className="w-5 h-5 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PlantingCalendar() {
  const { t, langLabel } = useTranslation();
  const [form, setForm] = useState({ seedType: '', location: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.seedType || !form.location) return toast.error('Both fields are required');
    setLoading(true);
    try {
      const res = await api.post('/ai/planting-calendar', { ...form, lang: langLabel }); // ← send language
      setResult(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate calendar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-sage-900 mb-4">{t('plantingCalendarTitle')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-1.5">{t('seedType')} *</label>
            <input type="text" className="input-field" placeholder="e.g., Carrots"
              value={form.seedType} onChange={(e) => setForm({ ...form, seedType: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-1.5">{t('locationLabel')} *</label>
            <input type="text" className="input-field" placeholder="e.g., Chennai, India"
              value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-6">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
          {loading ? t('generating') : t('generateCalendar')}
        </button>
      </form>

      {result?.calendar && (
        <div className="animate-slide-up">
          {result.summary && (
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 mb-5">
              <p className="text-sage-700 text-sm leading-relaxed">{result.summary}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(STATUS_COLORS).map(([status, cls]) => (
              <span key={status} className={cn('badge capitalize', cls)}>{status}</span>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {MONTHS.map((month) => {
              const data = result.calendar[month];
              if (!data) return null;
              return (
                <div key={month} className="bg-sage-50 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sage-800 text-sm">{month.slice(0, 3)}</span>
                    <span className={cn('badge text-xs', STATUS_COLORS[data.status] || 'bg-sage-200 text-sage-600')}>
                      {data.status}
                    </span>
                  </div>
                  <p className="text-sage-500 text-xs leading-relaxed">{data.activity}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-sage-50 rounded-xl p-4">
      <div className="flex items-center gap-2 text-sage-600 text-sm font-medium mb-2">
        <Icon className="w-4 h-4 text-brand-500" /> {title}
      </div>
      <div className="text-sage-600 text-sm space-y-1">{children}</div>
    </div>
  );
}
