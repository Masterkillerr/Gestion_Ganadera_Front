import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Accessible wrapper around React Router Link
 * Ensures proper contrast, focus states, and keyboard navigation
 */
export const AccessibleLink = ({
  to,
  children,
  className = 'text-brand-400 hover:text-brand-300 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-dark-950 rounded px-1',
  ...props
}) => {
  return (
    <Link
      to={to}
      className={className}
      {...props}
    >
      {children}
    </Link>
  );
};

export default AccessibleLink;
