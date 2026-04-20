'use client';
import { useEffect, useState, useCallback } from 'react';
import { Search, SlidersHorizontal, Leaf } from 'lucide-react';
import api from '@/lib/api';
import { ListingCard } from '@/components/listings/ListingCard';
import { LoadingGrid } from '@/components/ui/LoadingGrid';
import { useTranslation } from '@/context/TranslationContext';
import toast from 'react-hot-toast';
import { useDebounce } from '@/hooks/useDebounce';

export default function BrowsePage() {
  const { t } = useTranslation();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/listings', {
        params: { search: debouncedSearch || undefined, page, limit: 12 },
      });
      setListings(res.data.listings);
      setTotalPages(res.data.pages);
    } catch {
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => { fetchListings(); }, [fetchListings]);
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-sage-900 mb-1">{t('welcomeTitle')}</h1>
        <p className="text-sage-500 text-sm">{t('welcomeSubtitle')}</p>
      </div>

      <div className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-400" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <button className="btn-secondary flex items-center gap-2 px-4">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">{t('filter')}</span>
        </button>
      </div>

      {loading ? <LoadingGrid /> : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mb-4">
            <Leaf className="w-8 h-8 text-sage-400" />
          </div>
          <h3 className="font-display text-xl text-sage-700 mb-2">{t('noSeedsFound')}</h3>
          <p className="text-sage-500 text-sm">{t('noSeedsDesc')}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {listings.map((listing) => <ListingCard key={listing._id} listing={listing} />)}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-brand-500 text-white' : 'bg-white border border-sage-200 text-sage-600 hover:bg-sage-50'}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
