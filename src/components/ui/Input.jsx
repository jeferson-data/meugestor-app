import React from 'react';

export function Input({ label, hint, error, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-brand-muted mb-2">
          {label} {hint && <span className="font-normal text-brand-subtle">{hint}</span>}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 rounded-xl bg-[#1A2A44] border border-brand-border text-brand-text placeholder-brand-subtle focus:outline-none focus:border-brand-green focus:ring-4 focus:ring-brand-green/10 transition ${className}`}
        {...props}
      />
      {error && <p className="text-brand-red text-sm mt-1">{error}</p>}
    </div>
  );
}