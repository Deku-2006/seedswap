'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusCircle, Leaf } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/context/authStore';
import { ListingCard } from '@/components/listings/ListingCard';
import { LoadingGrid } from '@/components/ui/LoadingGrid';
import toast from 'react-hot-toast';

export default function MyListingsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/auth'); return; }
    api.get('/listings/my')
      .then((r) => setListings(r.data.listings))
      .catch(() => toast.error('Failed to load your listings'))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-sage-900 mb-1">My Listings</h1>
          <p className="text-sage-500 text-sm">Manage your seed listings.</p>
        </div>
        <Link href="/listings/new" className="btn-primary flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> Add Listing
        </Link>
      </div>

      {loading ? <LoadingGrid count={4} /> : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mb-4">
            <Leaf className="w-8 h-8 text-sage-400" />
          </div>
          <h3 className="font-display text-xl text-sage-700 mb-2">No listings yet</h3>
          <p className="text-sage-500 text-sm mb-5">Start sharing your seeds with the community!</p>
          <Link href="/listings/new" className="btn-primary">Create your first listing</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {listings.map((l) => <ListingCard key={l._id} listing={l} />)}
        </div>
      )}
    </div>
  );
}
