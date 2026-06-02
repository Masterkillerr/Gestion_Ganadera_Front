import React from 'react';

export const EmptyState = ({
  title = 'No hay datos',
  description = 'No hay registros para mostrar en este momento',
  icon: Icon,
  action,
  actionLabel = 'Agregar nuevo'
}) => {
  return (
    <div className="empty-state animate-fade-up">
      {Icon && (
        <div className="empty-state-icon animate-pulse-glow mb-6">
          <Icon className="h-16 w-16 text-brand-500/60" />
        </div>
      )}
      <h3 className="empty-state-title text-gray-300 font-semibold">{title}</h3>
      <p className="empty-state-desc text-gray-500">{description}</p>
      {action && (
        <button
          onClick={action}
          className="btn-primary mt-6"
          aria-label={actionLabel}
        >
          + {actionLabel}
        </button>
      )}
    </div>
  );
};

// Icon exports for easy use
export const EmptyStateIcons = {
  // Document icon
  Document: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-8.25-4.5-8.25 4.5m16.5 0l-8.25 4.5m8.25-4.5v10.5l-8.25 4.5m0-10.5L3.75 7.5m8.25 4.5v10.5" />
    </svg>
  ),
  // Search/magnifying glass icon
  Search: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.5 5.5a7.5 7.5 0 0010.5 10.5z" />
    </svg>
  ),
  // Animal/cow icon
  Animal: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-8.25-4.5-8.25 4.5m16.5 0l-8.25 4.5m8.25-4.5v10.5l-8.25 4.5m0-10.5L3.75 7.5m8.25 4.5v10.5" />
    </svg>
  ),
  // Calendar icon
  Calendar: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  // Heart/health icon
  Health: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
};

export default EmptyState;
