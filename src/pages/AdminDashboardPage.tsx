import React, { useState } from 'react';
import { User, Challenge, ChallengeStatus, AuditLogItem, TabId } from '../types';
import { 
  Shield, FileText, CheckCircle2, Clock, AlertTriangle, 
  FileDown, Download, Users, Calendar, Award, Database, 
  ExternalLink, CheckCircle, RefreshCw 
} from 'lucide-react';

interface AdminDashboardPageProps {
  currentUser: User;
  challenges: Challenge[];
  auditLogs: AuditLogItem[];
  scholarsCount: number;
  fundingCount: number;
  workshopsCount: number;
  onUpdateChallengeResolution: (id: string, status: ChallengeStatus, notes: string) => void;
  onGenerateAnnualReportPdf: () => void;
  onNavigateTab: (tab: TabId) => void;
  onExportDatabaseJson: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  currentUser,
  challenges,
  auditLogs,
  scholarsCount,
  fundingCount,
  workshopsCount,
  onUpdateChallengeResolution,
  onGenerateAnnualReportPdf,
  onNavigateTab,
  onExportDatabaseJson,
}) => {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [resStatus, setResStatus] = useState<ChallengeStatus>('IN_REVIEW');
  const [resNotes, setResNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  const openChallenges = challenges.filter(c => c.status === 'OPEN');
  const inReviewChallenges = challenges.filter(c => c.status === 'IN_REVIEW');
  const resolvedChallenges = challenges.filter(c => c.status === 'RESOLVED');

  // Category Aggregation
  const categoryStats = challenges.reduce((acc, c) => {
    if (!acc[c.category]) {
      acc[c.category] = { total: 0, open: 0, inReview: 0, resolved: 0 };
    }
    acc[c.category].total += 1;
    if (c.status === 'OPEN') acc[c.category].open += 1;
    if (c.status === 'IN_REVIEW') acc[c.category].inReview += 1;
    if (c.status === 'RESOLVED') acc[c.category].resolved += 1;
    return acc;
  }, {} as Record<string, { total: number; open: number; inReview: number; resolved: number }>);

  const handleOpenResolutionModal = (ch: Challenge) => {
    setSelectedChallenge(ch);
    setResStatus(ch.status === 'OPEN' ? 'IN_REVIEW' : ch.status);
    setResNotes(ch.resolutionNotes || '');
  };

  const handleSaveResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedChallenge) {
      onUpdateChallengeResolution(selectedChallenge.id, resStatus, resNotes);
      setSelectedChallenge(null);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4 text-amber-600" />
            <span>Central University of Technology Academic Society</span>
            <span>·</span>
            <span>Executive Console</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#003261] tracking-tight">
            Administrator Governance Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Manage institutional tabs (1, 2, 8, 10), review scholar research bottlenecks, and generate the annual challenges report.
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-3">
          <button
            onClick={onGenerateAnnualReportPdf}
            className="px-4 py-2 bg-[#003261] hover:bg-[#002244] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-[#FBB927]" />
            Export Annual Challenges Report (PDF)
          </button>
          {currentUser.role === 'SUPER_ADMIN' && (
            <button
              onClick={onExportDatabaseJson}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5 text-[#003261]" />
              Super Admin Data Export (JSON)
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Challenge updated, resolution notes saved, and audit log recorded.</span>
        </div>
      )}

      {/* Institutional Tab Management (Tabs 1, 2, 8, 10) */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
          Institutional Tabs Governance (1, 2, 8, 10)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tab 1: About Us */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Tab 1 Governance</span>
              <h3 className="text-base font-bold text-slate-900 mt-1">About Us Content</h3>
              <p className="text-xs text-slate-500 mt-1">Institutional pillars, mission, and CUT history.</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => onNavigateTab('about')}
                className="text-xs font-bold text-[#003261] hover:underline cursor-pointer"
              >
                Open & Edit About Us &rarr;
              </button>
            </div>
          </div>

          {/* Tab 2: Project Leaders */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Tab 2 Governance</span>
              <h3 className="text-base font-bold text-slate-900 mt-1">Project Leaders & Admins</h3>
              <p className="text-xs text-slate-500 mt-1">Steering committee portfolios, bios, and leads.</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => onNavigateTab('leaders')}
                className="text-xs font-bold text-[#003261] hover:underline cursor-pointer"
              >
                Open & Edit Leaders &rarr;
              </button>
            </div>
          </div>

          {/* Tab 8: Funding Available */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Tab 8 Governance</span>
              <h3 className="text-base font-bold text-slate-900 mt-1">Funding & Bursary Calls</h3>
              <p className="text-xs text-slate-500 mt-1">{fundingCount} active opportunities listed.</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => onNavigateTab('funding')}
                className="text-xs font-bold text-[#003261] hover:underline cursor-pointer"
              >
                Manage Funding & Landing Calls &rarr;
              </button>
            </div>
          </div>

          {/* Tab 10: Workshops */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Tab 10 Governance</span>
              <h3 className="text-base font-bold text-slate-900 mt-1">Workshops & Colloquiums</h3>
              <p className="text-xs text-slate-500 mt-1">{workshopsCount} seminars currently scheduled.</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => onNavigateTab('workshops')}
                className="text-xs font-bold text-[#003261] hover:underline cursor-pointer"
              >
                Schedule & Edit Workshops &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Challenge Review Queue */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">Postgraduate Research Challenges Review Queue</h2>
            <p className="text-xs text-slate-500">
              Review scholar problems, provide advisory intervention notes, and update status lifecycle.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded">
              {openChallenges.length} Open
            </span>
            <span className="font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded">
              {inReviewChallenges.length} In Review
            </span>
            <span className="font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded">
              {resolvedChallenges.length} Resolved
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {challenges.map((ch) => (
            <div
              key={ch.id}
              className={`p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                ch.status === 'OPEN' ? 'bg-amber-50/20' : ''
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    ch.status === 'OPEN'
                      ? 'bg-amber-100 text-amber-800'
                      : ch.status === 'IN_REVIEW'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {ch.status.replace('_', ' ')}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="font-bold text-slate-700">{ch.category.replace('_', ' ')}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-600">
                    Scholar: <b>{ch.scholarName}</b> ({ch.scholarCategory})
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-400">{ch.createdAt}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {ch.title}
                </h3>

                <p className="text-xs text-slate-700 leading-relaxed line-clamp-2">
                  {ch.description}
                </p>

                {ch.resolutionNotes && (
                  <div className="text-xs text-emerald-800 bg-emerald-50/70 p-2.5 rounded border border-emerald-200 mt-2">
                    <span className="font-bold">Intervention on file:</span> {ch.resolutionNotes}
                  </div>
                )}
              </div>

              <div className="flex-shrink-0">
                <button
                  onClick={() => handleOpenResolutionModal(ch)}
                  className="px-4 py-2 bg-[#003261] hover:bg-[#002244] text-white text-xs font-bold rounded shadow-sm transition-colors cursor-pointer"
                >
                  {ch.status === 'RESOLVED' ? 'Update Resolution' : 'Review & Resolve &rarr;'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Yearly Challenge Analytics Table (Summarising challenges by category and status) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 mb-6 gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Yearly Challenges Breakdown by Category & Status ({new Date().getFullYear()})
            </h2>
            <p className="text-xs text-slate-500">
              Aggregated institutional reporting metrics prepared for CUT Senate and Research Directorate.
            </p>
          </div>
          <button
            onClick={onGenerateAnnualReportPdf}
            className="px-3.5 py-1.5 bg-[#FBB927] hover:bg-amber-400 text-slate-900 font-bold text-xs rounded flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" /> Export as PDF
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#003261] text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="px-4 py-3">Challenge Category</th>
                <th className="px-4 py-3 text-center">Total Logged</th>
                <th className="px-4 py-3 text-center">Open</th>
                <th className="px-4 py-3 text-center">In Review</th>
                <th className="px-4 py-3 text-center">Resolved</th>
                <th className="px-4 py-3 text-center">Resolution Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {Object.entries(categoryStats).map(([catKey, stats], idx) => {
                const rate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
                return (
                  <tr key={catKey} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-4 py-3 font-bold text-slate-900">{catKey.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-center font-bold tabular-nums">{stats.total}</td>
                    <td className="px-4 py-3 text-center text-amber-700 font-semibold tabular-nums">{stats.open}</td>
                    <td className="px-4 py-3 text-center text-blue-700 font-semibold tabular-nums">{stats.inReview}</td>
                    <td className="px-4 py-3 text-center text-emerald-700 font-bold tabular-nums">{stats.resolved}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-slate-800 tabular-nums">{rate}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Audit Log */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Security & Operational Audit Log</h2>
            <p className="text-xs text-slate-500">Live immutable log of logins, deletions, and administrative actions.</p>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            AUDIT DAEMON ACTIVE
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Actor & Role</th>
                <th className="px-6 py-3">Target</th>
                <th className="px-6 py-3">Details</th>
                <th className="px-6 py-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80">
                  <td className="px-6 py-3 whitespace-nowrap text-slate-400 font-mono text-[11px]">{log.timestamp}</td>
                  <td className="px-6 py-3 whitespace-nowrap font-bold text-slate-900">{log.action}</td>
                  <td className="px-6 py-3 whitespace-nowrap">{log.actorUsername} <span className="text-slate-400">({log.actorRole})</span></td>
                  <td className="px-6 py-3 whitespace-nowrap text-slate-500">{log.targetObject || '-'}</td>
                  <td className="px-6 py-3 text-slate-700">{log.details}</td>
                  <td className="px-6 py-3 whitespace-nowrap font-mono text-slate-400 text-[11px]">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Challenge Resolution Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col">
            <div className="bg-[#003261] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#FBB927]">
              <div>
                <h3 className="text-base font-bold">Review Challenge #{selectedChallenge.id}</h3>
                <span className="text-xs text-amber-200">
                  {selectedChallenge.scholarName} ({selectedChallenge.scholarCategory}) · {selectedChallenge.category}
                </span>
              </div>
              <button
                onClick={() => setSelectedChallenge(null)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveResolution} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">Scholar Problem Description:</span>
                <p className="text-slate-800 leading-relaxed">{selectedChallenge.description}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status Lifecycle</label>
                <select
                  value={resStatus}
                  onChange={(e) => setResStatus(e.target.value as ChallengeStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                >
                  <option value="OPEN">Open (Pending Assessment)</option>
                  <option value="IN_REVIEW">In Review (Intervention in Progress)</option>
                  <option value="RESOLVED">Resolved (Intervention Completed)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Resolution Guidance & Administrative Action</label>
                <textarea
                  rows={5}
                  value={resNotes}
                  onChange={(e) => setResNotes(e.target.value)}
                  placeholder="Record intervention: laboratory booking slot arranged, Turnitin equation filter formula applied, supervisor mediation conducted..."
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white font-sans"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedChallenge(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded text-xs font-semibold hover:bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#003261] text-white rounded text-xs font-bold hover:bg-[#002244] transition-colors cursor-pointer"
                >
                  Save Resolution & Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
