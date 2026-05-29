import React, { useEffect, useRef } from 'react';

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', variant = 'danger' }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 animate-fade-up"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="glass-card p-6 w-full max-w-sm mx-4 animate-fade-up">
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-full shrink-0 ${
            variant === 'danger' ? 'bg-red-900/30 text-red-400' :
            variant === 'warning' ? 'bg-amber-900/30 text-amber-400' :
            'bg-brand-900/30 text-brand-400'
          }`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={variant === 'danger'
                ? 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                : 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              } />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-100">{title}</h3>
            <p className="text-sm text-gray-400 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-dark-400">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-100 hover:bg-dark-500 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 ${
              variant === 'danger' ? 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-600/30' :
              variant === 'warning' ? 'bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-600/30' :
              'bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-600/30'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function DetailModal({ isOpen, onClose, title, fields }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 animate-fade-up"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="glass-card p-6 w-full max-w-lg mx-4 animate-fade-up">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-100">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-3">
          {fields.map((field, idx) => (
            <div key={idx}>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">{field.label}</span>
              <p className="text-sm text-gray-200 whitespace-pre-wrap break-words bg-dark-600/50 rounded-lg px-3 py-2">{field.value || '—'}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6 pt-4 border-t border-dark-400">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-100 hover:bg-dark-500 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
