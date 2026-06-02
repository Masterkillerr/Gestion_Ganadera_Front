import React from 'react';
import { Skeleton } from './LoadingSpinner';

export function SkeletonTable({ rows = 5, columns = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className={j === 0 ? 'w-12 h-8' : 'flex-1 h-8'} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-card p-6 space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonGrid({ items = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="glass-card p-4 space-y-3">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonFormField() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export function SkeletonForm({ fields = 6 }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: fields }).map((_, i) => (
          <SkeletonFormField key={i} />
        ))}
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
