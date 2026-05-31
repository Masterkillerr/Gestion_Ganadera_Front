import React from 'react';

export default function StatCard({ title, value, unit, icon, iconContainerClass, children, className = '' }) {
 return (
 <article className={`stat-card ${className}`}>
 <div className="flex items-start justify-between">
 <div>
 <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</p>
 <h3 className="mt-1 text-3xl font-bold text-gray-100">
 {value}
 {unit && <span className="ml-1 text-base font-normal text-gray-500">{unit}</span>}
 </h3>
 </div>
 <div className={`rounded-lg border p-2.5 ${iconContainerClass}`}>{icon}</div>
 </div>
 {children && <div className="mt-4">{children}</div>}
 </article>
 );
}
