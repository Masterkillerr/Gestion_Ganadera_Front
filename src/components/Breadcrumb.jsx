import React from 'react';
import { Link } from 'react-router-dom';

export function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 mb-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          {index > 0 && (
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}

          {item.href ? (
            <Link
              to={item.href}
              className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
              aria-current={index === items.length - 1 ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-sm text-gray-400" aria-current="page">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
