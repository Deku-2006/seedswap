'use client';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Leaf } from 'lucide-react';
import { getInitials, timeAgo, truncate } from '@/lib/utils';

interface Props {
  listing: {
    _id: string;
    title: string;
    description: string;
    seedType: string;
    quantity: string;
    image: string | null;
    owner: { _id: string; name: string; location: string; avatar: string | null };
    createdAt: string;
  };
}

export function ListingCard({ listing }: Props) {
  return (
    <Link href={`/listings/${listing._id}`}>
      <div className="bg-white rounded-2xl overflow-hidden border border-sage-100 card-hover cursor-pointer h-full flex flex-col">
        {/* Image */}
        <div className="relative h-44 bg-sage-50 overflow-hidden">
          {listing.image ? (
            <Image
              src={listing.image}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 300px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Leaf className="w-12 h-12 text-sage-200" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className="badge bg-white/90 text-sage-700 backdrop-blur-sm border border-sage-200/50">
              {listing.seedType}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-display font-medium text-sage-900 text-base mb-1 leading-snug">
            {listing.title}
          </h3>
          <p className="text-sage-500 text-xs leading-relaxed mb-3 flex-1">
            {truncate(listing.description, 80)}
          </p>

          {/* Owner */}
          <div className="flex items-center gap-2 pt-2 border-t border-sage-100">
            {listing.owner.avatar ? (
              <img
                src={listing.owner.avatar}
                alt={listing.owner.name}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-xs flex items-center justify-center font-medium">
                {getInitials(listing.owner.name)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sage-800 truncate">{listing.owner.name}</p>
              <p className="text-xs text-sage-400 flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" />
                {listing.owner.location || 'Earth'}
              </p>
            </div>
            <span className="text-xs text-sage-400 shrink-0">{timeAgo(listing.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
