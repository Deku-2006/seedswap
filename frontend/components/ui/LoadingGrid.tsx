export function LoadingGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden border border-sage-100 animate-pulse">
          <div className="h-44 bg-sage-100" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-sage-100 rounded w-3/4" />
            <div className="h-3 bg-sage-100 rounded w-full" />
            <div className="h-3 bg-sage-100 rounded w-2/3" />
            <div className="flex items-center gap-2 pt-2 border-t border-sage-100">
              <div className="w-7 h-7 rounded-full bg-sage-100" />
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-sage-100 rounded w-1/2" />
                <div className="h-2 bg-sage-100 rounded w-1/3" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-sage-100 rounded animate-pulse ${className}`} />;
}
