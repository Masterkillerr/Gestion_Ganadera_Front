import React from 'react';

export default function StatCard({ title, value, unit, icon, iconContainerClass, children, className = "" }) {
  return (
    <div className={`stat-card ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-100">
            {value}
            {unit && <span className="text-lg font-normal text-gray-500 ml-1">{unit}</span>}
          </h3>
        </div>
        <div className={`p-2.5 rounded-lg border ${iconContainerClass}`}>
          {icon}
        </div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
