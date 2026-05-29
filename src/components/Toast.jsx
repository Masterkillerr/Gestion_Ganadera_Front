import React from 'react';

const ICONS = {
  success: (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const STYLES = {
  success: {
    bg: 'bg-emerald-900/40',
    border: 'border-emerald-700/50',
    iconBg: 'bg-emerald-800/40',
    iconText: 'text-emerald-400',
    text: 'text-emerald-100',
  },
  error: {
    bg: 'bg-red-900/40',
    border: 'border-red-700/50',
    iconBg: 'bg-red-800/40',
    iconText: 'text-red-400',
    text: 'text-red-100',
  },
  info: {
    bg: 'bg-blue-900/40',
    border: 'border-blue-700/50',
    iconBg: 'bg-blue-800/40',
    iconText: 'text-blue-400',
    text: 'text-blue-100',
  },
};

export function ToastItem({ toast, onClose }) {
  const style = STYLES[toast.type] || STYLES.info;

  return (
    <div
      className={`flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-md shadow-xl ${style.bg} ${style.border}`}
      role="alert"
    >
      <div className={`p-1.5 rounded-lg shrink-0 ${style.iconBg} ${style.iconText}`}>
        {ICONS[toast.type] || ICONS.info}
      </div>
      <p className={`text-sm leading-5 flex-1 pt-0.5 ${style.text}`}>
        {toast.message}
      </p>
      <button
        onClick={onClose}
        className="shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-black/20 transition-colors"
        aria-label="Cerrar notificación"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
