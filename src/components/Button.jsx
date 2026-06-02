import React from 'react';

export function Button({
  children,
  type = 'button',
  variant = 'primary', // primary, secondary, danger
  size = 'md', // sm, md, lg
  loading = false,
  disabled = false,
  className = '',
  onClick,
  ...props
}) {
  const baseClasses = 'font-medium rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: '!bg-red-600 hover:!bg-red-500 shadow-lg shadow-red-600/30 text-white',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}
