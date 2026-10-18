import React from 'react';

export interface PageHeaderButtonProps {
  variant?: 'primary' | 'accent' | 'secondary' | 'danger';
  onClick?: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
}

export const PageHeaderButton: React.FC<PageHeaderButtonProps> = ({
  variant = 'primary',
  onClick,
  icon,
  children,
  disabled = false,
  className = '',
  type = 'button',
  title,
}) => {
  const baseClasses =
    'h-[44px] px-5 rounded-[4px] text-xs font-semibold whitespace-nowrap flex-shrink-0 inline-flex items-center justify-center gap-2 transition-colors cursor-pointer select-none w-auto';

  const variantClasses = {
    // Primary / Download: Solid CUT brand blue
    primary:
      'bg-[#255190] hover:bg-[#183765] text-white shadow-xs disabled:opacity-50 disabled:cursor-not-allowed',
    // Main Call to Action: Solid CUT gold accent with dark text
    accent:
      'bg-[#FDB813] hover:bg-[#e5a610] text-slate-900 font-bold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed',
    // Secondary: Light outlined with blue border and blue text
    secondary:
      'bg-white hover:bg-blue-50/50 text-[#255190] border border-[#255190]/50 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed',
    // Danger: Outlined muted red
    danger:
      'bg-white hover:bg-red-50 text-red-700 border border-red-300 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed',
  }[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string | React.ReactNode;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
  hideDivider?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  eyebrow,
  title,
  description,
  actions,
  badge,
  className = '',
  hideDivider = false,
}) => {
  return (
    <div className={`w-full mb-6 ${className}`}>
      {/* 1. Small Eyebrow Label */}
      {eyebrow && (
        <div className="text-[11px] font-bold text-[#255190] uppercase tracking-wider mb-1 flex items-center gap-2">
          <span>{eyebrow}</span>
          {badge}
        </div>
      )}

      {/* 2. Page Title */}
      <h1 className="text-xl sm:text-2xl font-semibold text-[#255190] leading-tight flex items-center gap-3">
        <span>{title}</span>
        {!eyebrow && badge}
      </h1>

      {/* 3. Subtitle / Description */}
      {description && (
        <div className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl mt-1.5">
          {description}
        </div>
      )}

      {/* 4. Action Buttons Row (Below subtitle, left-aligned, nowrap, flex-wrap) */}
      {actions && (
        <div className="flex flex-wrap gap-3 items-center mt-4 mb-5">
          {actions}
        </div>
      )}

      {/* 5. Thin Divider Line */}
      {!hideDivider && <div className="border-b border-slate-200 w-full mt-4" />}
    </div>
  );
};
