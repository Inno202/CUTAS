import React, { useState } from 'react';
import { User, FundingOpportunity } from '../types';
import { Plus, Edit3, ExternalLink, Calendar, DollarSign, CheckCircle2 } from 'lucide-react';

interface FundingPageProps {
  currentUser: User | null;
  funding: FundingOpportunity[];
  onAddFunding: (opp: Omit<FundingOpportunity, 'id'>) => void;
  onEditFunding: (id: string, updated: Partial<FundingOpportunity>) => void;
}

export const FundingPage: React.FC<FundingPageProps> = ({
  currentUser,
  funding,
  onAddFunding,
  onEditFunding,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    funder: '',
    amountRange: '',
    deadline: '',
    eligibility: '',
    applicationProcess: '',
    portalUrl: '',
    featuredOnLanding: true,
    isActive: true,
  });

  const isCutAdmin = currentUser && currentUser.role !== 'SCHOLAR';

  const resetForm = () => {
    setFormData({
      title: '',
      funder: '',
      amountRange: '',
      deadline: '',
      eligibility: '',
      applicationProcess: '',
      portalUrl: '',
      featuredOnLanding: true,
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleStartEdit = (opp: FundingOpportunity) => {
    setEditingId(opp.id);
    setFormData({
      title: opp.title,
      funder: opp.funder,
      amountRange: opp.amountRange,
      deadline: opp.deadline,
      eligibility: opp.eligibility,
      applicationProcess: opp.applicationProcess,
      portalUrl: opp.portalUrl,
      featuredOnLanding: opp.featuredOnLanding,
      isActive: opp.isActive,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onEditFunding(editingId, formData);
    } else {
      onAddFunding(formData);
    }
    resetForm();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
            Bursaries, Grants & Fellowships
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#003261] tracking-tight">
            Funding Available and Application Processes
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Comprehensive directory of National Research Foundation (NRF) calls, CUT postgraduate bursaries, and international research mobility grants.
          </p>
        </div>

        {isCutAdmin && (
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => {
                if (showForm) resetForm();
                else {
                  resetForm();
                  setShowForm(true);
                }
              }}
              className="px-4 py-2 bg-[#003261] hover:bg-[#002244] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#FBB927]" />
              {showForm ? 'Close Form' : 'Publish Grant Call (Admin)'}
            </button>
          </div>
        )}
      </div>

      {/* Admin Add/Edit Form */}
      {showForm && isCutAdmin && (
        <div className="bg-slate-50 border border-slate-300 rounded-xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-1">
            {editingId ? 'Edit Funding Opportunity' : 'Publish New Funding Opportunity'}
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Changes will be reflected here and on the main CUTAS landing page.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Opportunity Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. NRF Master’s and Doctoral Scholarships"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Funding Body / Sponsor</label>
                <input
                  type="text"
                  value={formData.funder}
                  onChange={(e) => setFormData({ ...formData, funder: e.target.value })}
                  placeholder="e.g. National Research Foundation (NRF)"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Award Value / Amount Range</label>
                <input
                  type="text"
                  value={formData.amountRange}
                  onChange={(e) => setFormData({ ...formData, amountRange: e.target.value })}
                  placeholder="e.g. R140,000 p.a. + Research Operating Allowance"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Closing Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Application Portal Link</label>
                <input
                  type="url"
                  value={formData.portalUrl}
                  onChange={(e) => setFormData({ ...formData, portalUrl: e.target.value })}
                  placeholder="https://nrfconnect.nrf.ac.za"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Eligibility Criteria</label>
                <textarea
                  rows={3}
                  value={formData.eligibility}
                  onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white font-sans"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Step-by-Step Application Instructions</label>
                <textarea
                  rows={4}
                  value={formData.applicationProcess}
                  onChange={(e) => setFormData({ ...formData, applicationProcess: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white font-sans"
                  required
                />
              </div>

              <div className="sm:col-span-2 flex items-center space-x-6">
                <label className="flex items-center space-x-2 font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.featuredOnLanding}
                    onChange={(e) => setFormData({ ...formData, featuredOnLanding: e.target.checked })}
                    className="rounded text-[#003261]"
                  />
                  <span>Feature on Landing Page</span>
                </label>
                <label className="flex items-center space-x-2 font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-[#003261]"
                  />
                  <span>Active Call</span>
                </label>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded text-xs font-semibold hover:bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#003261] text-white rounded text-xs font-bold hover:bg-[#002244] transition-colors cursor-pointer"
              >
                {editingId ? 'Save Changes' : 'Publish Opportunity'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Funding Cards List */}
      <div className="space-y-6">
        {funding.map((opp) => (
          <div
            key={opp.id}
            className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm hover:border-slate-300 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-1">
                  {opp.funder}
                </span>
                <h2 className="text-xl font-bold text-slate-900 leading-snug">
                  {opp.title}
                </h2>
              </div>

              <div className="text-left sm:text-right flex-shrink-0">
                <span className="text-xs text-slate-500 block">Application Deadline</span>
                <span className="text-sm font-bold text-slate-900 block">{opp.deadline}</span>
              </div>
            </div>

            <div className="py-4 space-y-4 text-xs text-slate-700">
              <div>
                <h3 className="font-bold uppercase tracking-wider text-slate-500 mb-1 text-[11px]">
                  Eligibility Criteria
                </h3>
                <p className="whitespace-pre-line leading-relaxed text-slate-800">{opp.eligibility}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-bold uppercase tracking-wider text-[#003261] mb-1.5 text-[11px]">
                  Step-by-Step Application Process
                </h3>
                <p className="whitespace-pre-line leading-relaxed text-slate-800">{opp.applicationProcess}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                {opp.portalUrl && (
                  <a
                    href={opp.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#FBB927] hover:bg-amber-400 text-slate-900 font-bold rounded shadow-sm inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>Access Official Funder Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {isCutAdmin && (
                <button
                  onClick={() => handleStartEdit(opp)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Opportunity (Admin)
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
