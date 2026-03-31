import React from 'react';

export default function Button({ 
  children, 
  variant = 'gold', 
  className = '', 
  disabled = false, 
  ...props 
}) {
  const baseStyles = 'px-8 py-4 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 transform active:scale-95 shadow-lg flex items-center justify-center gap-2 inline-flex';
  
  const variants = {
    gold: 'bg-eden-gold text-white hover:shadow-eden-gold/40 hover:-translate-y-0.5 disabled:bg-gray-400',
    dark: 'bg-eden-dark text-white hover:bg-[#0a1a1e] border border-white/5 disabled:opacity-50',
    outline: 'border border-eden-gold text-eden-gold hover:bg-eden-gold hover:text-white disabled:border-gray-300 disabled:text-gray-300'
  };

  return (
    <button 
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}