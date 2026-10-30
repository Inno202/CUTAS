import React, { useEffect, useState } from 'react';
import { Search, Shield } from 'lucide-react';
import { adminApi } from '../../api/endpoints';
import { ErrorBlock, LoadingBlock, inputClass } from '../../components/ui';
import { errorMessage } from '../../hooks/useAsync';
import type { AuditLogItem, Paginated } from '../../types';
import { formatDateTime } from '../../utils/format';
import { Pager, SectionCard, useDebounced } from './shared';

const ACTIONS = ['', 'LOGIN', 'LOGIN_FAILED', 'LOGIN_LOCKED', 'MFA_FAILED', 'MFA_ENROLLED', 'MFA_RESET', 'LOGOUT', 'REGISTER',
  'PASSWORD_CHANGE', 'PASSWORD_RESET', 'ACCOUNT_DELETED', 'CHALLENGE_REVIEW', 'CONTENT_EDIT', 'USER_CREATE', 'USER_UPDATE',
  'SCHOLAR_CATEGORY_CHANGE', 'DATA_EXPORT', 'REPORT_EXPORT'];

export const AuditSection: React.FC = () => {
  const [action, setAction] = useState('');
  const [search, setSearch] = useState('');
  const query = useDebounced(search);
  const [since, setSince] = useState('');
  const [until, setUntil] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<AuditLogItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => setPage(1), [action, query, since, until]);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    adminApi.auditLogs({ action, search: query, since, until, page })
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(errorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [action, query, since, until, page, reloadKey]);

  const rows = data?.results ?? [];
  return (
    <SectionCard
      title="System Security Audit Trail"
      description={<span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-600" /> Append-only record of sign-ins, role changes, publishing, challenge reviews and data exports. Entries cannot be edited or deleted.</span>}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <select value={action} onChange={(e) => setAction(e.target.value)} aria-label="Filter by action" className={inputClass}>
          {ACTIONS.map((a) => <option key={a} value={a}>{a || 'All actions'}</option>)}
        </select>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="User, target or detail" aria-label="Search audit log" maxLength={100} className={`${inputClass} pl-8`} />
        </div>
        <input type="date" value={since} onChange={(e) => setSince(e.target.value)} aria-label="From date" className={inputClass} />
        <input type="date" value={until} onChange={(e) => setUntil(e.target.value)} aria-label="To date" className={inputClass} />
      </div>

      {loading && !data ? <LoadingBlock /> : error ? <ErrorBlock message={error} onRetry={() => setReloadKey((k) => k + 1)} /> : (
        <>
          <ul className="md:hidden divide-y divide-slate-100 border border-slate-200 rounded-[6px]">
            {rows.map((log) => (
              <li key={log.id} className="p-3 text-[11px] space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-[#255190] font-bold text-[10px]">{log.action}</span>
                  <span className="text-slate-400">{formatDateTime(log.timestamp)}</span>
                </div>
                <div><b>{log.actorUsername}</b> <span className="text-slate-400">({log.actorRole})</span></div>
                {(log.targetObject || log.details) && <div className="text-slate-600 break-words">{[log.targetObject, log.details].filter(Boolean).join(' · ')}</div>}
                <div className="text-slate-400 font-mono">{log.ipAddress || '—'}</div>
              </li>
            ))}
          </ul>
          <div className="hidden md:block border border-slate-200 rounded-[6px] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Time</th>
                  <th scope="col" className="p-3 font-semibold">Actor</th>
                  <th scope="col" className="p-3 font-semibold">Action</th>
                  <th scope="col" className="p-3 font-semibold">Target / details</th>
                  <th scope="col" className="p-3 font-semibold">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {rows.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 align-top">
                    <td className="p-3 whitespace-nowrap text-slate-500">{formatDateTime(log.timestamp)}</td>
                    <td className="p-3 whitespace-nowrap"><span className="font-bold text-slate-900 block">{log.actorUsername}</span><span className="text-[10px] text-slate-400">{log.actorRole}</span></td>
                    <td className="p-3 whitespace-nowrap"><span className="px-2 py-0.5 rounded bg-blue-50 text-[#255190] font-bold text-[10px]">{log.action}</span></td>
                    <td className="p-3 text-slate-700 max-w-xs break-words">{[log.targetObject, log.details].filter(Boolean).join(' · ')}</td>
                    <td className="p-3 whitespace-nowrap text-slate-400 font-mono">{log.ipAddress || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length === 0 && <p className="text-xs text-slate-500 text-center py-6">No audit entries match.</p>}
          {data && <Pager page={page} count={data.count} onPage={setPage} />}
        </>
      )}
    </SectionCard>
  );
};
