import React from 'react';

interface SwiftButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'prominent' | 'bordered' | 'destructive' | 'plain' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
}

export const SwiftButton: React.FC<SwiftButtonProps> = ({
  children,
  variant = 'bordered',
  size = 'md',
  icon,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-colors duration-150 select-none rounded-md cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

  const sizeClasses = {
    sm: 'px-3 py-1 text-xs gap-1.5 min-h-[28px]',
    md: 'px-4 py-1.5 text-xs font-medium gap-2 min-h-[32px]',
    lg: 'px-5 py-2 text-sm font-medium gap-2.5 min-h-[38px]'
  }[size];

  const variantClasses = {
    prominent: 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-xs',
    bordered: 'bg-[#333333] hover:bg-[#444444] active:bg-[#2A2A2A] text-white border border-[#444444]',
    destructive: 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white border border-rose-500/30',
    plain: 'text-blue-400 hover:text-blue-300 hover:bg-[#333333]/50 px-2 py-1',
    ghost: 'text-[#999999] hover:text-white hover:bg-[#333333] active:bg-[#2A2A2A]'
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
};
