import React, { useState } from 'react';
import { User, Award } from '../types';
import { FileDown, Plus, Trophy, Award as AwardIcon, Trash2 } from 'lucide-react';

interface AwardsPageProps {
  currentUser: User;
  awards: Award[];
  onAddAward: (award: Omit<Award, 'id' | 'userId'>) => void;
  onDeleteAward: (id: string) => void;
  onDownloadPdf: () => void;
}

export const AwardsPage: React.FC<AwardsPageProps> = ({
  currentUser,
  awards,
  onAddAward,
  onDeleteAward,
  onDownloadPdf,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [awardingBody, setAwardingBody] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [description, setDescription] = useState('');

  const userAwards = awards.filter(a => a.userId === currentUser.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAward({
      title,
      awardingBody,
      year,
      description,
    });
    setTitle('');
    setAwardingBody('');
    setDescription('');
    setShowAddForm(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
            Academic Honours & Distinctions
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#003261] tracking-tight">
            Awards and Recognitions
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Scholar-populated academic honours, best paper presentations, postgraduate merit distinctions, and fellowship awards.
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button
            onClick={onDownloadPdf}
            className="px-4 py-2 bg-[#003261] hover:bg-[#002244] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-[#FBB927]" />
            Download Awards Dossier (PDF)
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-[#FBB927] hover:bg-amber-400 text-slate-900 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? 'Close Form' : 'Add Recognition'}
          </button>
        </div>
      </div>

      {/* Add Award Form */}
      {showAddForm && (
        <div className="bg-slate-50 border border-slate-300 rounded-xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-1">Record Scholarly Award or Honour</h2>
          <p className="text-xs text-slate-500 mb-4">
            Honours will be archived in your CUTAS academic profile and included in your exportable dossier.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Award Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Best Oral Presentation Award - PowerAfrica 2024"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Awarding Institution / Body</label>
                <input
                  type="text"
                  value={awardingBody}
                  onChange={(e) => setAwardingBody(e.target.value)}
                  placeholder="e.g. IEEE Power & Energy Society / CUT Directorate of Research"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Year Conferred</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Description / Citation Background</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe the criteria or achievement recognized..."
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white font-sans"
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
                Save Award Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Awards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {userAwards.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs mb-3">
                <span className="font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-[#FBB927]" />
                  Year {item.year} Distinction
                </span>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete award "${item.title}"?`)) {
                      onDeleteAward(item.id);
                    }
                  }}
                  className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer p-1"
                  title="Remove award entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1.5 leading-snug">
                {item.title}
              </h3>

              <div className="text-xs text-slate-500 font-medium mb-3">
                Conferred by: <span className="text-slate-800">{item.awardingBody}</span>
              </div>

              {item.description && (
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">
                  {item.description}
                </p>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Scholar: {currentUser.title} {currentUser.lastName}</span>
              <span className="text-emerald-700 font-semibold">Verified Academic Honour</span>
            </div>
          </div>
        ))}

        {userAwards.length === 0 && (
          <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-500">
            No awards or distinctions recorded yet. Click "+ Add Recognition" above to add your merit achievements.
          </div>
        )}
      </div>
    </div>
  );
};
