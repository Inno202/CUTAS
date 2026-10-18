import React, { useState } from 'react';
import { User, Publication, PublicationType, PublicationStatus } from '../types';
import { FileDown, Plus, Trash2, Edit3, BookOpen, ExternalLink, CheckCircle } from 'lucide-react';

interface PublicationsPageProps {
  currentUser: User;
  publications: Publication[];
  onAddPublication: (pub: Omit<Publication, 'id' | 'userId'>) => void;
  onEditPublication: (id: string, updated: Partial<Publication>) => void;
  onDeletePublication: (id: string) => void;
  onDownloadPdf: () => void;
}

export const PublicationsPage: React.FC<PublicationsPageProps> = ({
  currentUser,
  publications,
  onAddPublication,
  onEditPublication,
  onDeletePublication,
  onDownloadPdf,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPubId, setEditingPubId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    publicationType: 'ARTICLE' as PublicationType,
    title: '',
    authors: '',
    outletName: '',
    year: new Date().getFullYear(),
    volumeIssuePages: '',
    doiOrUrl: '',
    status: 'PUBLISHED' as PublicationStatus,
  });

  const resetForm = () => {
    setFormData({
      publicationType: 'ARTICLE',
      title: '',
      authors: `${currentUser.lastName}, ${currentUser.firstName[0]}.`,
      outletName: '',
      year: new Date().getFullYear(),
      volumeIssuePages: '',
      doiOrUrl: '',
      status: 'PUBLISHED',
    });
    setEditingPubId(null);
    setShowAddForm(false);
  };

  const handleStartEdit = (pub: Publication) => {
    setEditingPubId(pub.id);
    setFormData({
      publicationType: pub.publicationType,
      title: pub.title,
      authors: pub.authors,
      outletName: pub.outletName,
      year: pub.year,
      volumeIssuePages: pub.volumeIssuePages || '',
      doiOrUrl: pub.doiOrUrl || '',
      status: pub.status,
    });
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPubId) {
      onEditPublication(editingPubId, formData);
    } else {
      onAddPublication(formData);
    }
    resetForm();
  };

  const getStatusBadge = (status: PublicationStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return 'text-emerald-800 bg-emerald-50 border border-emerald-200';
      case 'ACCEPTED':
        return 'text-blue-800 bg-blue-50 border border-blue-200';
      case 'UNDER_REVIEW':
        return 'text-amber-800 bg-amber-50 border border-amber-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
            DHET Accredited Scholarly Outputs
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#003261] tracking-tight">
            Publication Record
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Book chapters, peer-reviewed journal articles, and conference proceedings authored during your studies.
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button
            onClick={onDownloadPdf}
            className="px-4 py-2 bg-[#003261] hover:bg-[#002244] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-[#FBB927]" />
            Download Publication Record (PDF)
          </button>
          <button
            onClick={() => {
              if (showAddForm) resetForm();
              else {
                resetForm();
                setShowAddForm(true);
              }
            }}
            className="px-4 py-2 bg-[#FBB927] hover:bg-amber-400 text-slate-900 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? 'Close Form' : 'Add Publication'}
          </button>
        </div>
      </div>

      {/* Add / Edit Publication Form */}
      {showAddForm && (
        <div className="bg-slate-50 border border-slate-300 rounded-xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-1">
            {editingPubId ? 'Edit Publication Record' : 'Record New Scholarly Publication'}
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Outputs will be indexed on your CUTAS academic profile and included in your exportable dossier.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Publication Type</label>
                <select
                  value={formData.publicationType}
                  onChange={(e) => setFormData({ ...formData, publicationType: e.target.value as PublicationType })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                >
                  <option value="ARTICLE">Peer-Reviewed Journal Article</option>
                  <option value="BOOK_CHAPTER">Book Chapter</option>
                  <option value="CONFERENCE">Conference Proceeding</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as PublicationStatus })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                >
                  <option value="PUBLISHED">Published</option>
                  <option value="ACCEPTED">Accepted / In Press</option>
                  <option value="UNDER_REVIEW">Submitted / Under Review</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Title of Work</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Full title of article, chapter, or paper"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Authors (in citation format)</label>
                <input
                  type="text"
                  value={formData.authors}
                  onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                  placeholder="e.g. Dlamini, N., Mthembu, K., & Ramaphosa, S. R."
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Journal, Book, or Conference Name</label>
                <input
                  type="text"
                  value={formData.outletName}
                  onChange={(e) => setFormData({ ...formData, outletName: e.target.value })}
                  placeholder="e.g. Journal of Applied Nanobiotechnology"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Year of Publication</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Volume, Issue, Pages (optional)</label>
                <input
                  type="text"
                  value={formData.volumeIssuePages}
                  onChange={(e) => setFormData({ ...formData, volumeIssuePages: e.target.value })}
                  placeholder="Vol. 14, No. 2, pp. 110-128"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">DOI Link or Repository URL (optional)</label>
                <input
                  type="text"
                  value={formData.doiOrUrl}
                  onChange={(e) => setFormData({ ...formData, doiOrUrl: e.target.value })}
                  placeholder="https://doi.org/10.xxxx/yyyy"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                />
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
                {editingPubId ? 'Save Changes' : '+ Add to Dossier'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Publications List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-700">
            Recorded Outputs ({publications.length})
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {publications.map((pub) => (
            <div
              key={pub.id}
              className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-[#003261]">{pub.publicationType.replace('_', ' ')}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-500">Year: <b>{pub.year}</b></span>
                  <span className="text-slate-300">·</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getStatusBadge(pub.status)}`}>
                    {pub.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {pub.title}
                </h3>

                <p className="text-xs text-slate-600">
                  <span className="text-slate-400">Authors:</span> {pub.authors}
                </p>

                <p className="text-xs text-slate-500 italic">
                  {pub.outletName}
                  {pub.volumeIssuePages && `, ${pub.volumeIssuePages}`}
                </p>

                {pub.doiOrUrl && (
                  <a
                    href={pub.doiOrUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-700 hover:underline inline-flex items-center gap-1 pt-0.5"
                  >
                    <span>{pub.doiOrUrl}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Edit and Delete Actions */}
              <div className="flex items-center space-x-2 flex-shrink-0 text-xs">
                <button
                  onClick={() => handleStartEdit(pub)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete publication "${pub.title}"?`)) {
                      onDeletePublication(pub.id);
                    }
                  }}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}

          {publications.length === 0 && (
            <div className="p-12 text-center text-xs text-slate-500">
              No publications recorded in your dossier yet. Click "+ Add Publication" above to add your journal papers, book chapters, or conference proceedings.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
