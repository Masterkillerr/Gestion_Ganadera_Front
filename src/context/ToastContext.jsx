import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { ToastItem } from '../components/Toast';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [removingIds, setRemovingIds] = useState(new Set());
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    setRemovingIds(prev => new Set([...prev, id]));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      setRemovingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 250);
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
  }, []);

  const showToast = useCallback((message, { type = 'error', duration = 4000 } = {}) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      timersRef.current[id] = setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const success = useCallback((msg, opts) => showToast(msg, { ...opts, type: 'success' }), [showToast]);
  const error = useCallback((msg, opts) => showToast(msg, { ...opts, type: 'error' }), [showToast]);
  const info = useCallback((msg, opts) => showToast(msg, { ...opts, type: 'info' }), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, removeToast }}>
      {children}
      {/* Toast Container — fixed position overlay */}
      <div
        aria-live="polite"
        aria-label="Notificaciones"
        className="toast-container"
      >
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem
              toast={toast}
              onClose={() => removeToast(toast.id)}
              isRemoving={removingIds.has(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast debe usarse dentro de un ToastProvider');
  }
  return ctx;
}
