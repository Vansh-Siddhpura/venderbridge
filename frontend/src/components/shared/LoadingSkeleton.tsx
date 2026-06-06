interface LoadingSkeletonProps {
  rows?: number;
  type?: 'table' | 'card' | 'detail';
}

export function LoadingSkeleton({ rows = 5, type = 'table' }: LoadingSkeletonProps) {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="card card__body flex flex-col gap-3">
            <div className="skeleton h-4 w-1/3" />
            <div className="skeleton h-8 w-1/2" />
            <div className="skeleton h-3 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'detail') {
    return (
      <div className="card">
        <div className="card__header">
          <div className="flex w-full flex-col gap-2">
            <div className="skeleton h-5 w-1/3" />
            <div className="skeleton h-4 w-1/4" />
          </div>
        </div>
        <div className="card__body grid grid-cols-1 gap-6 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <div className="skeleton h-3 w-1/4" />
              <div className="skeleton h-5 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card__header">
        <div className="flex w-full gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="skeleton h-4 flex-1" />
          ))}
        </div>
      </div>
      <div className="card__body flex flex-col gap-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="skeleton h-5 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
