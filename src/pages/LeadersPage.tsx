import React, { useState } from 'react';
import { User, InstitutionalContent } from '../types';
import { Edit3, CheckCircle, Save, Mail, Phone } from 'lucide-react';

interface LeadersPageProps {
  currentUser: User | null;
  content: InstitutionalContent;
  administrators: User[];
  onUpdateContent: (key: 'project_leaders', title: string, headline: string, body: string) => void;
}

export const LeadersPage: React.FC<LeadersPageProps> = ({
  currentUser,
  content,
  administrators,
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
    onUpdateContent('project_leaders', title, headline, body);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
            Society Governance & Stewardship
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
              {isEditing ? 'Cancel Editing' : 'Edit Executive Copy (Admin)'}
            </button>
          </div>
        )}
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Executive narrative updated and saved to CUTAS database.</span>
        </div>
      )}

      {isEditing && isCutAdmin ? (
        <div className="bg-slate-50 border border-slate-300 rounded-xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4">Edit Project Leaders & Governance Narrative</h2>
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
              <label className="block font-bold text-slate-700 mb-1">Body Text (Portfolios, Executive Mandates)</label>
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
          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {content.body}
          </div>
        </div>
      )}

      {/* Leadership Profile Cards */}
      <div>
        <h2 className="text-base font-bold text-[#003261] uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
          Active Steering Committee & Society Administrators
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {administrators.map((admin) => (
            <div
              key={admin.id}
              className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start space-x-3.5 sm:space-x-4 mb-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#003261] text-white flex items-center justify-center font-bold text-base sm:text-lg flex-shrink-0 shadow-inner">
                    {admin.firstName[0]}{admin.lastName[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                      {admin.role === 'SUPER_ADMIN' ? 'Super Administrator (Developer/Lead)' : 'Project Leader & Administrator'}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {admin.title} {admin.firstName} {admin.lastName}
                    </h3>
                    <p className="text-xs text-slate-600 truncate mt-0.5">{admin.faculty}</p>
                    <p className="text-[11px] text-slate-400 truncate">{admin.department}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                  {admin.bio}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 text-[#003261] break-all">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" /> {admin.email}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
