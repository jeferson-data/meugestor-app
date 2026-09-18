import React from 'react';

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-brand-card rounded-2xl border border-brand-border p-5 ${className}`}>
      {children}
    </div>
  );
}

export function KpiCard({ label, value, help, highlight, color = 'green' }) {
  const base =
    'bg-brand-card rounded-2xl border border-brand-border p-5 transition hover:border-brand-green';
  const hl = highlight
    ? 'bg-gradient-to-br from-[#0F2844] to-[#0B1A2E] border-brand-green shadow-[0_0_30px_rgba(0,223,162,0.08)]'
    : '';

  const colors = {
    green: 'text-brand-green',
    red: 'text-brand-red',
    blue: 'text-brand-blue',
  };

  return (
    <div className={`${base} ${hl}`}>
      <div className="text-brand-muted text-sm mb-2">{label}</div>
      <div className={`text-2xl font-extrabold ${highlight ? 'text-brand-green' : colors[color]}`}>
        {value}
      </div>
      {help && <div className="text-brand-subtle text-xs mt-1">{help}</div>}
    </div>
  );
}