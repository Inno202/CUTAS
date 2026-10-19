import React, { useState } from 'react';
import { User, Challenge, ChallengeCategory, ChallengeStatus } from '../types';
import { PageHeader, PageHeaderButton } from '../components/PageHeader';
import { FileDown, Plus, AlertCircle, CheckCircle, Clock, Shield, Send } from 'lucide-react';

interface ChallengesPageProps {
  currentUser: User;
  challenges: Challenge[];
  onSubmitChallenge: (ch: Omit<Challenge, 'id' | 'userId' | 'scholarName' | 'scholarCategory' | 'status' | 'createdAt'>) => void;
  onUpdateResolution?: (challengeId: string, status: ChallengeStatus, notes: string) => void;
  onDownloadPdf: () => void;
}

export const ChallengesPage: React.FC<ChallengesPageProps> = ({
  currentUser,
  challenges,
  onSubmitChallenge,
  onUpdateResolution,
  onDownloadPdf,
}) => {
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [category, setCategory] = useState<ChallengeCategory>('WRITING');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState(false);

  // Filter for scholar: scholars see their own items, admins can see all or their own
  const visibleChallenges = currentUser.role === 'SCHOLAR'
    ? challenges.filter(c => c.userId === currentUser.id)
    : challenges;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitChallenge({
      category,
      title,
      description,
    });
    setTitle('');
    setDescription('');
    setShowSubmitForm(false);
    setSubmittedMessage(true);
    setTimeout(() => setSubmittedMessage(false), 4000);
  };

  const getStatusBadge = (status: ChallengeStatus) => {
    switch (status) {
      case 'OPEN':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'IN_REVIEW':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'RESOLVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        eyebrow="Institutional Research Intervention Desk"
        title="Challenges and Solutions"
        description="Submit research roadblocks (funding, Turnitin similarity index, thesis writing, lab access, ethics approval) for society leadership resolution."
        actions={
          <>
            <PageHeaderButton
              variant="accent"
              onClick={() => setShowSubmitForm(!showSubmitForm)}
              icon={<Plus className="w-4 h-4" />}
            >
              {showSubmitForm ? 'Close Form' : 'Submit Problem'}
            </PageHeaderButton>
            <PageHeaderButton
              variant="secondary"
              onClick={onDownloadPdf}
              icon={<FileDown className="w-4 h-4" />}
            >
              Download Challenges Log (PDF)
            </PageHeaderButton>
          </>
        }
      />

      {submittedMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-[4px] text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Research problem logged successfully. CUTAS mentors and administrators have received the notification.</span>
        </div>
      )}

      {/* Submission Form */}
      {showSubmitForm && (
        <div className="bg-slate-50 border border-[#E2E8F0] rounded-[6px] p-6 sm:p-8 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-1">Submit a Research Challenge</h2>
          <p className="text-xs text-slate-500 mb-4">
            Confidential problem submission routed directly to the CUTAS Project Leaders and Faculty Mentors.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Challenge Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ChallengeCategory)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                required
              >
                <option value="FUNDING">Funding & Bursary Disbursements</option>
                <option value="TURNITIN">Turnitin / Plagiarism Similarity Calibration</option>
                <option value="WRITING">Academic Writing & Thesis Structure</option>
                <option value="SUPERVISION">Supervision & Advisory Support</option>
                <option value="LAB_ACCESS">Laboratory Access & Specialized Equipment</option>
                <option value="ETHICS">Faculty Ethics Board Clearance</option>
                <option value="DATA_ANALYSIS">Methodology & Statistical Software (R, Jamovi, Python)</option>
                <option value="OTHER">Other Academic Roadblock</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Problem Subject / Summary</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief synopsis of the issue"
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Detailed Description & Impact on Postgraduate Milestones</label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the specific bottleneck, previous actions taken, and what intervention is required from CUTAS leadership..."
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white font-sans"
                required
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSubmitForm(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded text-xs font-semibold hover:bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#255190] text-white rounded-[4px] text-xs font-semibold hover:bg-[#183765] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" /> Submit Research Problem
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Challenges List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Showing {visibleChallenges.length} recorded items</span>
        </div>

        {visibleChallenges.map((ch) => (
          <div
            key={ch.id}
            className="bg-white rounded-[6px] border border-[#E2E8F0] p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 uppercase tracking-wider">{ch.category.replace('_', ' ')}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-500">Logged: {ch.createdAt}</span>
                  {currentUser.role !== 'SCHOLAR' && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="font-semibold text-slate-700">Scholar: {ch.scholarName} ({ch.scholarCategory})</span>
                    </>
                  )}
                </div>

                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-[4px] border ${getStatusBadge(ch.status)}`}>
                  {ch.status.replace('_', ' ')}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-3 mb-2">{ch.title}</h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line mb-4 bg-slate-50/60 p-4 rounded-[4px] border border-slate-100">
                {ch.description}
              </p>
            </div>

            {/* Official Resolution Block */}
            {ch.resolutionNotes ? (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-[4px] text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                    Official Society Resolution & Action Taken:
                  </span>
                  {ch.resolvedAt && (
                    <span className="text-[10px] text-emerald-700">{ch.resolvedAt}</span>
                  )}
                </div>
                <p className="text-emerald-800 leading-relaxed whitespace-pre-line pt-1">
                  {ch.resolutionNotes}
                </p>
                {ch.resolvedBy && (
                  <div className="text-[10px] text-emerald-600 pt-1">
                    Resolved by: <b>{ch.resolvedBy}</b>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] text-xs text-slate-500 italic flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Pending review by CUTAS project leader or assigned faculty mentor.</span>
              </div>
            )}
          </div>
        ))}

        {visibleChallenges.length === 0 && (
          <div className="bg-white rounded-[6px] border border-[#E2E8F0] p-12 text-center text-xs text-slate-500">
            No research problems logged. If you encounter roadblocks with Turnitin similarity, equipment, or supervision, click "+ Submit Problem".
          </div>
        )}
      </div>
    </div>
  );
};
