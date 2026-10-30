import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface SectionProps {
  /** Lets the console refresh its sidebar badges after a change. */
  onChanged: () => void;
}

export const SectionCard: React.FC<{
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, description, actions, children }) => (
  <section className="bg-white rounded-[6px] border border-[#E2E8F0] shadow-xs p-4 sm:p-6 space-y-5 min-w-0">
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100">
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-[#255190]">{title}</h2>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
    {children}
  </section>
);

export const Pager: React.FC<{ page: number; count: number; pageSize?: number; onPage: (p: number) => void }> = ({
  page, count, pageSize = 25, onPage,
}) => {
  const pages = Math.max(1, Math.ceil(count / pageSize));
  if (count <= pageSize) return <div className="text-[11px] text-slate-500">{count} record{count === 1 ? '' : 's'}</div>;
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-slate-500">
        Page {page} of {pages} · {count} records
      </span>
      <div className="flex gap-2">
        <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page"
          className="min-h-9 px-3 rounded-[4px] border border-slate-300 bg-white disabled:opacity-40 cursor-pointer inline-flex items-center">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button type="button" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page"
          className="min-h-9 px-3 rounded-[4px] border border-slate-300 bg-white disabled:opacity-40 cursor-pointer inline-flex items-center">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export function useDebounced<T>(value: T, delay = 350): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export const FilterChips = <T extends string>({ value, options, onChange, label }: {
  value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string;
}) => (
  <div role="tablist" aria-label={label} className="flex flex-wrap gap-1.5">
    {options.map((o) => (
      <button key={o.value} type="button" role="tab" aria-selected={value === o.value} onClick={() => onChange(o.value)}
        className={`px-2.5 py-1.5 text-xs font-semibold rounded-[4px] cursor-pointer transition-colors ${
          value === o.value ? 'bg-[#255190] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}>
        {o.label}
      </button>
    ))}
  </div>
);
