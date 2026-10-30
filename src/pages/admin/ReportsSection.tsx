import React, { useState } from 'react';
import { FileDown, FileSpreadsheet } from 'lucide-react';
import { adminApi } from '../../api/endpoints';
import { Alert, ErrorBlock, LoadingBlock, Spinner, btnPrimary, btnSecondary, inputClass } from '../../components/ui';
import { CHALLENGE_CATEGORIES } from '../../constants';
import { useAction, useAsync } from '../../hooks/useAsync';
import { formatDate } from '../../utils/format';
import { SectionCard } from './shared';

const thisYear = new Date().getFullYear();
const YEARS = Array.from({ length: Math.max(1, thisYear - 2023 + 1) }, (_, i) => thisYear - i);

export const ReportsSection: React.FC = () => {
  const [year, setYear] = useState(thisYear);
  const report = useAsync(() => adminApi.annualReport(year), [year]);
  const pdf = useAction();
  const csv = useAction();
  const d = report.data;
  const max = Math.max(1, ...(d?.breakdown.map((b) => b.total) ?? [1]));

  return (
    <SectionCard
      title="Annual Challenges & Resolutions Report"
      description="What scholars struggled with this year and how each problem was resolved. Download the formal PDF for Senate or a CSV for Excel."
      actions={
        <label className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-700">Year</span>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className={`${inputClass} w-auto`}>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
      }
    >
      <div className="flex flex-col sm:flex-row gap-2">
        <button type="button" onClick={() => pdf.run(() => adminApi.annualReportPdf(year))} disabled={pdf.busy} className={btnPrimary}>
          {pdf.busy ? <Spinner className="w-3.5 h-3.5" /> : <FileDown className="w-3.5 h-3.5 text-[#FDB813]" />} Download {year} report (PDF)
        </button>
        <button type="button" onClick={() => csv.run(() => adminApi.annualReportCsv(year))} disabled={csv.busy} className={btnSecondary}>
          {csv.busy ? <Spinner className="w-3.5 h-3.5" /> : <FileSpreadsheet className="w-3.5 h-3.5" />} Export {year} (CSV / Excel)
        </button>
      </div>
      {(pdf.error || csv.error) && <Alert type="error">{pdf.error || csv.error}</Alert>}

      {report.loading && !d ? <LoadingBlock /> : report.error ? <ErrorBlock message={report.error} onRetry={report.reload} /> : d && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {[
              ['Logged', d.totals.total],
              ['Resolved', d.totals.resolved],
              ['Resolution rate', `${d.totals.resolutionRate}%`],
              ['Avg. days to resolve', d.totals.averageDaysToResolve ?? '—'],
            ].map(([label, value]) => (
              <div key={label as string} className="p-3 rounded-[6px] border border-slate-200 bg-slate-50">
                <div className="text-lg font-bold text-slate-900">{value}</div>
                <div className="text-[11px] text-slate-500">{label}</div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#255190] mb-2">By category</h3>
            {d.breakdown.length === 0 ? (
              <p className="text-xs text-slate-500">No challenges were logged in {year}.</p>
            ) : (
              <ul className="space-y-2.5">
                {d.breakdown.map((b) => (
                  <li key={b.category} className="text-xs">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                      <span className="font-semibold text-slate-800">{CHALLENGE_CATEGORIES.find((c) => c.value === b.category)?.label ?? b.label}</span>
                      <span className="text-slate-500">{b.total} logged · {b.resolved} resolved · {b.resolutionRate}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex" aria-hidden="true">
                      <div className="bg-emerald-500 h-full" style={{ width: `${(b.resolved / max) * 100}%` }} />
                      <div className="bg-amber-400 h-full" style={{ width: `${(b.inReview / max) * 100}%` }} />
                      <div className="bg-red-400 h-full" style={{ width: `${(b.open / max) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-3 mt-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Resolved</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> In review</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-400" /> Open</span>
            </div>
          </div>

          {d.resolvedItems.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#255190] mb-2">How problems were resolved</h3>
              <ul className="divide-y divide-slate-100 border border-slate-200 rounded-[6px]">
                {d.resolvedItems.slice(0, 50).map((r) => (
                  <li key={r.id} className="p-3 text-xs space-y-1">
                    <div className="flex flex-wrap justify-between gap-2">
                      <span className="font-semibold text-slate-900 break-words">#{r.id} · {r.title}</span>
                      <span className="text-slate-400">{formatDate(r.resolvedAt)}{r.daysToResolve !== null && ` · ${r.daysToResolve} days`}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">{r.category} · {r.scholar}</div>
                    <p className="text-slate-700 max-w-none whitespace-pre-line break-words">{r.resolutionNotes}</p>
                  </li>
                ))}
              </ul>
              {d.resolvedItems.length > 50 && <p className="text-[11px] text-slate-500 mt-2">Showing 50 of {d.resolvedItems.length}. The PDF and CSV include all of them.</p>}
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
};
