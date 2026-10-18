import React, { useState } from 'react';
import { User, InstitutionalContent } from '../types';
import { Edit3, CheckCircle, Save, Building2 } from 'lucide-react';

interface AboutPageProps {
  currentUser: User | null;
  content: InstitutionalContent;
  onUpdateContent: (key: 'about_us', title: string, headline: string, body: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  currentUser,
  content,
  onUpdateContent,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(content.title);
  const [headline, setHeadline] = useState(content.headline);
  const [body, setBody] = useState(content.body);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const isCutAdmin = currentUser && currentUser.role !== 'SCHOLAR';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateContent('about_us', title, headline, body);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
            Institutional Identity & Mandate
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#003261] tracking-tight">
            {content.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {content.headline}
          </p>
        </div>

        {isCutAdmin && (
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-[#003261] hover:bg-[#002244] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#FBB927]" />
              {isEditing ? 'Cancel Editing' : 'Edit Content (Admin)'}
            </button>
          </div>
        )}
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>About Us content saved to CUTAS database and audit log recorded.</span>
        </div>
      )}

      {isEditing && isCutAdmin ? (
        <div className="bg-slate-50 border border-slate-300 rounded-xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4">Edit About Us Institutional Copy</h2>
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Page Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Headline / Subtitle</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Body Text (Multi-paragraph narrative)</label>
              <textarea
                rows={12}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white font-sans leading-relaxed"
                required
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded text-xs font-semibold hover:bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#003261] text-white rounded text-xs font-bold hover:bg-[#002244] transition-colors cursor-pointer flex items-center gap-1.5 shadow"
              >
                <Save className="w-3.5 h-3.5" /> Save Changes
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="p-4 bg-amber-50/60 rounded-lg border-l-4 border-[#FBB927] text-xs text-amber-950 font-medium italic">
            "Bringing back intellectualism within the corridors of Higher Education: Creating a new generation of thinkers in UoTs"
          </div>

          <div className="prose max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-4">
            {content.body}
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Last updated by CUTAS Project Lead: {content.updatedAt}</span>
            <span>Central University of Technology, Free State</span>
          </div>
        </div>
      )}
    </div>
  );
};
