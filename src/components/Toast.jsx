import React from 'react';

const ICONS = {
 success: (
 <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 ),
 error: (
 <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 ),
 info: (
 <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 ),
};

const STYLES = {
 success: {
 wrapper: 'border-emerald-700/60 bg-emerald-950/70 text-emerald-100',
 icon: 'bg-emerald-800/60 text-emerald-300',
 },
 error: {
 wrapper: 'border-red-700/60 bg-red-950/70 text-red-100',
 icon: 'bg-red-800/60 text-red-300',
 },
 info: {
 wrapper: 'border-blue-700/60 bg-blue-950/70 text-blue-100',
 icon: 'bg-blue-800/60 text-blue-300',
 },
};

export function ToastItem({ toast, onClose }) {
 const style = STYLES[toast.type] || STYLES.info;

 return (
 <div
 className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-xl backdrop-blur-md ${style.wrapper}`}
 role="alert"
 aria-live="polite"
 >
 <div className={`rounded-md p-1.5 ${style.icon}`}>{ICONS[toast.type] || ICONS.info}</div>
 <p className="text-sm leading-5 flex-1 pt-0.5">{toast.message}</p>
 <button
 type="button"
 onClick={onClose}
 className="rounded-md p-1 text-gray-400 transition-colors hover:text-gray-200 hover:bg-black/20"
 aria-label="Cerrar notificación"
 >
 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>
 );
}
