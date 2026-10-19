import React, { useState } from 'react';
import { User, GrowthSuggestion, GrowthCompetency } from '../types';
import { PageHeader, PageHeaderButton } from '../components/PageHeader';
import { FileDown, Plus, Target, CheckCircle2, Clock } from 'lucide-react';

interface GrowthPageProps {
  currentUser: User;
  growthSuggestions: GrowthSuggestion[];
  onAddGrowth: (item: Omit<GrowthSuggestion, 'id' | 'userId'>) => void;
  onToggleComplete: (id: string) => void;
  onDownloadPdf: () => void;
}

export const GrowthPage: React.FC<GrowthPageProps> = ({
  currentUser,
  growthSuggestions,
  onAddGrowth,
  onToggleComplete,
  onDownloadPdf,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [area, setArea] = useState<GrowthCompetency>('WRITING');
  const [growthObjective, setGrowthObjective] = useState('');
  const [milestoneActions, setMilestoneActions] = useState('');
  const [targetQuarter, setTargetQuarter] = useState('Q3 2026');

  const userSuggestions = growthSuggestions.filter(g => g.userId === currentUser.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddGrowth({
      area,
      growthObjective,
      milestoneActions,
      targetQuarter,
      isCompleted: false,
    });
    setGrowthObjective('');
    setMilestoneActions('');
    setShowAddForm(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        eyebrow="Individual Scholar Development Plan"
        title="Suggestions for Your Growth"
        description="Scholar-populated milestones, targeted research competencies, and timeline commitments."
        actions={
          <>
            <PageHeaderButton
              variant="accent"
              onClick={() => setShowAddForm(!showAddForm)}
              icon={<Plus className="w-4 h-4" />}
            >
              {showAddForm ? 'Close Form' : 'Add Target'}
            </PageHeaderButton>
            <PageHeaderButton
              variant="secondary"
              onClick={onDownloadPdf}
              icon={<FileDown className="w-4 h-4" />}
            >
              Download Growth Plan (PDF)
            </PageHeaderButton>
          </>
        }
      />

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-slate-50 border border-[#E2E8F0] rounded-[6px] p-6 sm:p-8 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-1">Define New Growth Objective</h2>
          <p className="text-xs text-slate-500 mb-4">
            Identify specific skill goals such as competitive grant drafting, quantitative modeling, or high-impact writing.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Competency Area</label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value as GrowthCompetency)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                >
                  <option value="WRITING">High-Impact Academic Writing</option>
                  <option value="GRANTS">Competitive Grant & NRF Proposal Drafting</option>
                  <option value="ANALYTICS">Data Analytics & Quantitative Modeling</option>
                  <option value="NETWORKING">International Scholarly Dissemination</option>
                  <option value="PEDAGOGY">Undergraduate Tutoring & Pedagogy</option>
                  <option value="CAREER">Postdoctoral & Industry Placement</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Timeline</label>
                <input
                  type="text"
                  value={targetQuarter}
                  onChange={(e) => setTargetQuarter(e.target.value)}
                  placeholder="e.g. Q3 2026"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Growth Objective</label>
                <input
                  type="text"
                  value={growthObjective}
                  onChange={(e) => setGrowthObjective(e.target.value)}
                  placeholder="e.g. Master Structural Equation Modeling in Jamovi / R"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Action Steps & Concrete Milestones</label>
                <textarea
                  rows={4}
                  value={milestoneActions}
                  onChange={(e) => setMilestoneActions(e.target.value)}
                  placeholder="Step-by-step actions to achieve this competency..."
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white font-sans"
                  required
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded text-xs font-semibold hover:bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#255190] hover:bg-[#183765] text-white rounded-[4px] text-xs font-semibold transition-colors cursor-pointer"
              >
                Save Growth Target
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {userSuggestions.map((item) => (
          <div
            key={item.id}
            className={`rounded-[6px] border p-6 shadow-xs transition-all flex flex-col justify-between ${
              item.isCompleted
                ? 'bg-emerald-50/40 border-emerald-200'
                : 'bg-white border-[#E2E8F0] hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs mb-3">
                <span className="font-semibold text-[#255190] uppercase tracking-wider">{item.area}</span>
                <button
                  onClick={() => onToggleComplete(item.id)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-[4px] cursor-pointer transition-colors flex items-center gap-1 ${
                    item.isCompleted
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {item.isCompleted ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Achieved
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> In Progress ({item.targetQuarter})
                    </>
                  )}
                </button>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                {item.growthObjective}
              </h3>

              <div className="text-xs text-slate-700 space-y-2 mb-4">
                <div className="bg-slate-50 p-3 rounded-[4px] border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-1">Milestones & Action Plan:</span>
                  <p className="whitespace-pre-line text-slate-600 leading-relaxed">{item.milestoneActions}</p>
                </div>

                {item.mentorNotes && (
                  <div className="p-3 bg-amber-50 rounded-[4px] border border-amber-200 text-amber-900">
                    <span className="font-bold block mb-0.5">Advisor / Peer Feedback:</span>
                    <p className="text-amber-800 leading-relaxed">{item.mentorNotes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Target Timeline: {item.targetQuarter}</span>
              <span className="text-slate-500 font-medium">Click badge to toggle status</span>
            </div>
          </div>
        ))}

        {userSuggestions.length === 0 && (
          <div className="col-span-2 bg-white rounded-[6px] border border-[#E2E8F0] p-12 text-center text-xs text-slate-500">
            No personal growth targets defined yet. Click "+ Add Target" above to plan competencies, grant skills, and research objectives.
          </div>
        )}
      </div>
    </div>
  );
};
