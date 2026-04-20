'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin, Calendar, Package, Repeat2, ArrowLeft, MessageSquare, Leaf, Pencil, Trash2,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/context/authStore';
import { formatDate, getInitials } from '@/lib/utils';
import { LoadingSkeleton } from '@/components/ui/LoadingGrid';
import toast from 'react-hot-toast';

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then((r) => setListing(r.data.listing))
      .catch(() => toast.error('Listing not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChatToSwap = async () => {
    if (!user) return router.push('/auth');
    setChatLoading(true);
    try {
      const res = await api.post('/chat/create', {
        recipientId: listing.owner._id,
        listingId: listing._id,
      });
      router.push(`/chat?id=${res.data.chat._id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start chat');
    } finally {
      setChatLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this listing?')) return;
    try {
      await api.delete(`/listings/${id}`);
      toast.success('Listing deleted');
      router.push('/listings/my');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return (
    <div className="p-8 max-w-4xl mx-auto space-y-4">
      <LoadingSkeleton className="h-64 w-full rounded-2xl" />
      <LoadingSkeleton className="h-8 w-1/2" />
      <LoadingSkeleton className="h-4 w-3/4" />
    </div>
  );

  if (!listing) return (
    <div className="flex items-center justify-center h-64 text-sage-500">Listing not found.</div>
  );

  const isOwner = user && user._id === listing.owner._id;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <Link href="/browse" className="inline-flex items-center gap-1.5 text-sm text-sage-500 hover:text-sage-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Browse
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-sage-50 rounded-2xl overflow-hidden">
          {listing.image ? (
            <Image src={listing.image} alt={listing.title} fill className="object-cover" sizes="500px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Leaf className="w-20 h-20 text-sage-200" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <span className="badge bg-brand-50 text-brand-700 mb-2">{listing.seedType}</span>
            <h1 className="font-display text-3xl font-semibold text-sage-900 leading-tight">
              {listing.title}
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-sage-50 rounded-xl p-3">
              <div className="flex items-center gap-2 text-sage-500 text-xs mb-0.5">
                <Package className="w-3.5 h-3.5" /> Quantity
              </div>
              <p className="text-sage-800 font-medium text-sm">{listing.quantity}</p>
            </div>
            {listing.swapFor && (
              <div className="bg-sage-50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-sage-500 text-xs mb-0.5">
                  <Repeat2 className="w-3.5 h-3.5" /> Swap For
                </div>
                <p className="text-sage-800 font-medium text-sm">{listing.swapFor}</p>
              </div>
            )}
            <div className="bg-sage-50 rounded-xl p-3">
              <div className="flex items-center gap-2 text-sage-500 text-xs mb-0.5">
                <Calendar className="w-3.5 h-3.5" /> Listed
              </div>
              <p className="text-sage-800 font-medium text-sm">{formatDate(listing.createdAt)}</p>
            </div>
          </div>

          {/* Owner card */}
          <div className="flex items-center gap-3 p-4 bg-white border border-sage-100 rounded-xl">
            {listing.owner.avatar ? (
              <img src={listing.owner.avatar} alt={listing.owner.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-medium">
                {getInitials(listing.owner.name)}
              </div>
            )}
            <div>
              <p className="font-medium text-sage-800 text-sm">{listing.owner.name}</p>
              <p className="text-sage-500 text-xs flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {listing.owner.location || 'Earth'}
              </p>
            </div>
          </div>

          {/* Actions */}
          {isOwner ? (
            <div className="flex gap-3">
              <Link href={`/listings/${id}/edit`} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                <Pencil className="w-4 h-4" /> Edit
              </Link>
              <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors text-sm font-medium">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          ) : (
            <button
              onClick={handleChatToSwap}
              disabled={chatLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {chatLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <MessageSquare className="w-4 h-4" />
              )}
              Chat to Swap
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mt-8 bg-white border border-sage-100 rounded-2xl p-6">
        <h2 className="font-display text-lg font-semibold text-sage-800 mb-3">About this seed</h2>
        <p className="text-sage-600 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
        {listing.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {listing.tags.map((tag: string) => (
              <span key={tag} className="badge bg-brand-50 text-brand-600">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
