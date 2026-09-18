import React from 'react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed';

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  const variants = {
    primary: 'bg-brand-green text-brand-dark hover:bg-brand-greenD',
    secondary:
      'bg-transparent border border-brand-border text-brand-muted hover:border-brand-red hover:text-brand-red',
    ghost: 'bg-transparent text-brand-muted hover:text-brand-text',
    danger: 'bg-brand-red text-white hover:brightness-110',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}