
interface LoadingSkeletonProps {
  rows?: number;
  type?: 'table' | 'card' | 'detail';
}

export function LoadingSkeleton({ rows = 3, type = 'table' }: LoadingSkeletonProps) {
  const shimmerClass = "animate-pulse bg-slate-200 dark:bg-slate-800 rounded";

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="bg-surface border border-default p-5 rounded-lg flex flex-col gap-3">
            <div className={`h-4 w-1/3 ${shimmerClass}`} />
            <div className={`h-8 w-1/2 ${shimmerClass}`} />
            <div className={`h-3 w-3/4 ${shimmerClass}`} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'detail') {
    return (
      <div className="bg-surface border border-default p-6 rounded-lg flex flex-col gap-6">
        <div className="flex justify-between items-center pb-4 border-b border-default">
          <div className="flex flex-col gap-2 w-1/2">
            <div className={`h-6 w-3/4 ${shimmerClass}`} />
            <div className={`h-4 w-1/2 ${shimmerClass}`} />
          </div>
          <div className={`h-10 w-24 ${shimmerClass}`} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <div className={`h-3 w-1/4 ${shimmerClass}`} />
                <div className={`h-5 w-3/4 ${shimmerClass}`} />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <div className={`h-3 w-1/4 ${shimmerClass}`} />
                <div className={`h-5 w-3/4 ${shimmerClass}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default: table
  return (
    <div className="w-full bg-surface border border-default rounded-lg overflow-hidden">
      <div className="bg-elevated p-4 border-b border-default flex gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className={`h-4 flex-1 ${shimmerClass}`} />
        ))}
      </div>
      <div className="p-4 flex flex-col gap-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className={`h-5 flex-1 ${shimmerClass}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
