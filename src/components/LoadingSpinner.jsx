import React, { useEffect, useRef } from 'react';

const SIZE_CLASSES = {
 sm: 'w-5 h-5 border-2',
 md: 'w-8 h-8 border-[3px]',
 lg: 'w-12 h-12 border-4',
};

export function LoadingSpinner({ size = 'md', message, fullPage = false, className = '' }) {
 const spinner = (
 <div className={`flex flex-col items-center justify-center gap-3 ${fullPage ? 'min-h-[200px]' : ''} ${className}`}>
 <div
 className={`${SIZE_CLASSES[size]} rounded-full border-dark-400 border-t-brand-500 animate-spin`}
 role="status"
 aria-label="Cargando"
 />
 {message && (
 <p className="text-sm text-gray-400 animate-pulse">{message}</p>
 )}
 </div>
 );

 if (fullPage) {
 return <div className="flex items-center justify-center p-8">{spinner}</div>;
 }

 return spinner;
}

export function Skeleton({ className = '' }) {
 return (
 <div className={`relative overflow-hidden rounded-xl bg-dark-700 ${className}`}>
 <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-dark-600/60 to-transparent animate-[shimmer_1.4s_ease-in-out_infinite]" />
 </div>
 );
}
