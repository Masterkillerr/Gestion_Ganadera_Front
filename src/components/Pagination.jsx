import React from 'react';

export function Pagination({ currentPage = 1, totalPages = 1, onPageChange, disabled = false }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const showEllipsisStart = currentPage > 3;
  const showEllipsisEnd = currentPage < totalPages - 2;

  const visiblePages = pages.filter(
    (page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
  );

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={disabled || currentPage === 1}
        className="p-2 rounded-lg border border-dark-400 text-gray-400 hover:text-gray-100 hover:border-dark-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Página anterior"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {showEllipsisStart && (
        <>
          <PaginationButton page={1} current={currentPage} onChange={onPageChange} disabled={disabled} />
          <span className="text-gray-500">…</span>
        </>
      )}

      {visiblePages.map((page) => (
        <PaginationButton
          key={page}
          page={page}
          current={currentPage}
          onChange={onPageChange}
          disabled={disabled}
        />
      ))}

      {showEllipsisEnd && (
        <>
          <span className="text-gray-500">…</span>
          <PaginationButton
            page={totalPages}
            current={currentPage}
            onChange={onPageChange}
            disabled={disabled}
          />
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={disabled || currentPage === totalPages}
        className="p-2 rounded-lg border border-dark-400 text-gray-400 hover:text-gray-100 hover:border-dark-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Siguiente página"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
}

function PaginationButton({ page, current, onChange, disabled }) {
  const isActive = page === current;
  return (
    <button
      onClick={() => onChange(page)}
      disabled={disabled}
      className={`
        w-10 h-10 rounded-lg font-medium transition-colors
        ${
          isActive
            ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
            : 'border border-dark-400 text-gray-400 hover:text-gray-100 hover:border-dark-300'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      aria-current={isActive ? 'page' : undefined}
      aria-label={`Página ${page}`}
    >
      {page}
    </button>
  );
}
