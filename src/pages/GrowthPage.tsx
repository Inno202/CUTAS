import React, { useState } from 'react';
import { User, GrowthSuggestion, GrowthCompetency } from '../types';
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
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
            Individual Scholar Development Plan
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#003261] tracking-tight">
            Suggestions for Your Growth
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Scholar-populated milestones, targeted research competencies, and timeline commitments.
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button
            onClick={onDownloadPdf}
            className="px-4 py-2 bg-[#003261] hover:bg-[#002244] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-[#FBB927]" />
            Download Growth Plan (PDF)
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-[#FBB927] hover:bg-amber-400 text-slate-900 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? 'Close Form' : 'Add Target'}
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-slate-50 border border-slate-300 rounded-xl p-6 sm:p-8 shadow-sm">
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
                className="px-5 py-2 bg-[#003261] text-white rounded text-xs font-bold hover:bg-[#002244] transition-colors cursor-pointer"
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
            className={`rounded-xl border p-6 shadow-sm transition-all flex flex-col justify-between ${
              item.isCompleted
                ? 'bg-emerald-50/40 border-emerald-200'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs mb-3">
                <span className="font-bold text-[#003261] uppercase tracking-wider">{item.area}</span>
                <button
                  onClick={() => onToggleComplete(item.id)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded cursor-pointer transition-colors flex items-center gap-1 ${
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
                <div className="bg-slate-50 p-3 rounded border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-1">Milestones & Action Plan:</span>
                  <p className="whitespace-pre-line text-slate-600 leading-relaxed">{item.milestoneActions}</p>
                </div>

                {item.mentorNotes && (
                  <div className="p-3 bg-amber-50 rounded border border-amber-200 text-amber-900">
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
          <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-500">
            No personal growth targets defined yet. Click "+ Add Target" above to plan competencies, grant skills, and research objectives.
          </div>
        )}
      </div>
    </div>
  );
};
