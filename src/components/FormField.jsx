import React from 'react';

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  required = false,
  helperText,
  disabled = false,
  placeholder,
  autoComplete,
  className = '',
  children, // For custom select/textarea children
}) {
  const hasError = !!error;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-red-400 ml-1" aria-label="required">*</span>}
        </label>
      )}

      {type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${name}-error` : helperText ? `${name}-helper` : undefined}
          className={`input-field ${hasError ? 'border-red-500/50 focus:ring-red-500/40' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        >
          {children}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${name}-error` : helperText ? `${name}-helper` : undefined}
          className={`input-field resize-none ${hasError ? 'border-red-500/50 focus:ring-red-500/40' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        />
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${name}-error` : helperText ? `${name}-helper` : undefined}
          className={`input-field ${hasError ? 'border-red-500/50 focus:ring-red-500/40' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        />
      )}

      {helperText && !hasError && (
        <p id={`${name}-helper`} className="text-xs text-gray-500 mt-1">
          {helperText}
        </p>
      )}

      {hasError && (
        <p id={`${name}-error`} className="text-xs text-red-400 mt-1 flex items-center gap-1">
          <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L10 14.586 7.314 11.9a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8.101-8.101z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
