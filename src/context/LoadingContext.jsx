import React, { createContext, useContext, useState, useCallback } from 'react';
import { LoadingSpinner } from '../components/LoadingSpinner';

const LoadingContext = createContext(null);

export function LoadingProvider({ children }) {
  const [loadingState, setLoadingState] = useState({ isOpen: false, message: '' });

  const showLoading = useCallback((message = '') => {
    setLoadingState({ isOpen: true, message });
  }, []);

  const hideLoading = useCallback(() => {
    setLoadingState({ isOpen: false, message: '' });
  }, []);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading, isLoading: loadingState.isOpen }}>
      {children}
      {loadingState.isOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-dark-900/60 backdrop-blur-sm"
          role="alert"
          aria-busy="true"
          aria-label="Cargando"
        >
          <div className="glass-card p-8 flex flex-col items-center gap-4">
            <LoadingSpinner size="lg" />
            {loadingState.message && (
              <p className="text-sm text-gray-300">{loadingState.message}</p>
            )}
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    throw new Error('useLoading debe usarse dentro de un LoadingProvider');
  }
  return ctx;
}
