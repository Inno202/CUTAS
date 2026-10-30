import React, { useEffect, useId, useRef } from 'react';
import { AlertCircle, CheckCircle2, Info, Loader2, RefreshCw, X } from 'lucide-react';

export const inputClass =
  'w-full px-3 py-2.5 sm:py-2 rounded-[4px] border border-slate-300 bg-white text-xs text-slate-900 ' +
  'focus:outline-none focus:ring-2 focus:ring-[#255190] focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500';

export const btnPrimary =
  'inline-flex items-center justify-center gap-1.5 min-h-10 px-5 py-2 bg-[#255190] hover:bg-[#183765] text-white ' +
  'rounded-[4px] text-xs font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed';

export const btnSecondary =
  'inline-flex items-center justify-center gap-1.5 min-h-10 px-4 py-2 border border-slate-300 text-slate-700 bg-white ' +
  'hover:bg-slate-50 rounded-[4px] text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60';

export const btnAccent =
  'inline-flex items-center justify-center gap-1.5 min-h-10 px-4 py-2 bg-[#FDB813] hover:bg-[#e5a610] text-slate-900 ' +
  'rounded-[4px] text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-60';

export const btnDanger =
  'inline-flex items-center justify-center gap-1.5 min-h-10 px-4 py-2 bg-red-600 hover:bg-red-700 text-white ' +
  'rounded-[4px] text-xs font-bold transition-colors cursor-pointer disabled:opacity-60';

export const cardClass = 'bg-white rounded-[6px] border border-[#E2E8F0] shadow-xs';

// ---------------------------------------------------------------- feedback
export const Alert: React.FC<{
  type?: 'success' | 'error' | 'info' | 'warning';
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}> = ({ type = 'info', children, onClose, className = '' }) => {
  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    info: 'bg-blue-50 border-blue-200 text-slate-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
  }[type];
  const Icon = type === 'success' ? CheckCircle2 : type === 'info' ? Info : AlertCircle;
  const iconColor = { success: 'text-emerald-600', error: 'text-red-600', info: 'text-[#255190]', warning: 'text-amber-600' }[type];
  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={`p-3 rounded-[4px] border text-xs flex items-start gap-2 ${styles} ${className}`}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${iconColor}`} aria-hidden="true" />
      <div className="flex-1 min-w-0 font-medium break-words">{children}</div>
      {onClose && (
        <button type="button" onClick={onClose} className="p-0.5 opacity-70 hover:opacity-100 cursor-pointer" aria-label="Dismiss">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export const Spinner: React.FC<{ className?: string; label?: string }> = ({ className = 'w-4 h-4', label }) => (
  <Loader2 className={`animate-spin ${className}`} aria-label={label ?? 'Loading'} role="status" />
);

export const LoadingBlock: React.FC<{ label?: string }> = ({ label = 'Loading…' }) => (
  <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-slate-500">
    <Spinner className="w-6 h-6 text-[#255190]" label={label} />
    <span>{label}</span>
  </div>
);

export const ErrorBlock: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="p-6 bg-red-50 border border-red-200 rounded-[6px] text-center text-xs text-red-900 space-y-3" role="alert">
    <AlertCircle className="w-6 h-6 text-red-600 mx-auto" aria-hidden="true" />
    <p className="mx-auto">{message}</p>
    {onRetry && (
      <button type="button" onClick={onRetry} className={btnSecondary}>
        <RefreshCw className="w-3.5 h-3.5" /> Try again
      </button>
    )}
  </div>
);

export const EmptyState: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`${cardClass} p-8 sm:p-12 text-center text-xs text-slate-500 ${className}`}>{children}</div>
);

// ---------------------------------------------------------------- form fields
export const Field: React.FC<{
  label: string;
  error?: string;
  hint?: React.ReactNode;
  required?: boolean;
  className?: string;
  children: (id: string) => React.ReactNode;
}> = ({ label, error, hint, required, className = '', children }) => {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-700 mb-1">
        {label}
        {required && <span className="text-red-600" aria-hidden="true"> *</span>}
      </label>
      {children(id)}
      {error ? (
        <span className="text-[11px] text-red-600 mt-1 block" role="alert">{error}</span>
      ) : hint ? (
        <span className="text-[11px] text-slate-500 mt-1 block">{hint}</span>
      ) : null}
    </div>
  );
};

// ---------------------------------------------------------------- modal / confirm
export const Modal: React.FC<{
  open: boolean;
  title: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'default' | 'brand';
}> = ({ open, title, onClose, children, footer, size = 'md', tone = 'default' }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const target = panelRef.current?.querySelector<HTMLElement>('input, select, textarea, button:not([data-close])');
      (target ?? panelRef.current)?.focus();
    }, 0);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  const width = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' }[size];
  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`bg-white w-full ${width} rounded-t-[10px] sm:rounded-[6px] shadow-2xl border border-slate-300 flex flex-col max-h-[92dvh] sm:max-h-[88vh] outline-none`}
      >
        <div
          className={`px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 border-b flex-shrink-0 ${
            tone === 'brand' ? 'bg-[#255190] text-white border-[#FDB813] border-b-2 rounded-t-[10px] sm:rounded-t-[6px]' : 'border-slate-100'
          }`}
        >
          <h2 id={titleId} className={`text-sm font-bold min-w-0 ${tone === 'brand' ? 'text-white' : 'text-[#255190]'}`}>
            {title}
          </h2>
          <button
            type="button"
            data-close
            onClick={onClose}
            className={`p-1.5 rounded-[4px] cursor-pointer flex-shrink-0 ${tone === 'brand' ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-5 overflow-y-auto text-xs text-slate-800 space-y-4">{children}</div>
        {footer && (
          <div className="px-4 sm:px-5 py-3 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 flex-shrink-0 rounded-b-[6px]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const ConfirmDialog: React.FC<{
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ open, title, message, confirmLabel = 'Confirm', danger = true, busy, error, onConfirm, onCancel }) => (
  <Modal
    open={open}
    title={title}
    onClose={onCancel}
    size="sm"
    footer={
      <>
        <button type="button" onClick={onCancel} className={btnSecondary} disabled={busy}>
          Cancel
        </button>
        <button type="button" onClick={onConfirm} className={danger ? btnDanger : btnPrimary} disabled={busy}>
          {busy && <Spinner className="w-3.5 h-3.5" />}
          {confirmLabel}
        </button>
      </>
    }
  >
    {error && <Alert type="error">{error}</Alert>}
    <div className="text-xs text-slate-600 leading-relaxed">{message}</div>
  </Modal>
);

export const StatusPill: React.FC<{ className: string; children: React.ReactNode }> = ({ className, children }) => (
  <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-[4px] uppercase tracking-wide whitespace-nowrap ${className}`}>
    {children}
  </span>
);
