import React, { useState } from 'react';
import { User, Workshop } from '../types';
import { Plus, Edit3, Calendar, Clock, MapPin, Users, Video } from 'lucide-react';

interface WorkshopsPageProps {
  currentUser: User | null;
  workshops: Workshop[];
  onAddWorkshop: (ws: Omit<Workshop, 'id'>) => void;
  onEditWorkshop: (id: string, updated: Partial<Workshop>) => void;
}

export const WorkshopsPage: React.FC<WorkshopsPageProps> = ({
  currentUser,
  workshops,
  onAddWorkshop,
  onEditWorkshop,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    facilitator: '',
    eventDate: '',
    eventTime: '',
    venueOrLink: '',
    category: 'Methodology & Writing',
    description: '',
  });

  const isCutAdmin = currentUser && currentUser.role !== 'SCHOLAR';

  const resetForm = () => {
    setFormData({
      title: '',
      facilitator: '',
      eventDate: '',
      eventTime: '',
      venueOrLink: '',
      category: 'Methodology & Writing',
      description: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleStartEdit = (ws: Workshop) => {
    setEditingId(ws.id);
    setFormData({
      title: ws.title,
      facilitator: ws.facilitator,
      eventDate: ws.eventDate,
      eventTime: ws.eventTime,
      venueOrLink: ws.venueOrLink,
      category: ws.category,
      description: ws.description,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onEditWorkshop(editingId, formData);
    } else {
      onAddWorkshop(formData);
    }
    resetForm();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
            Academic Capacity Development
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#003261] tracking-tight">
            Upcoming Workshops and Seminars
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Specialized colloquiums, thesis writing masterclasses, DHET publishing bootcamps, and research methodology training.
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
              {showForm ? 'Close Form' : 'Schedule Workshop (Admin)'}
            </button>
          </div>
        )}
      </div>

      {/* Admin Add/Edit Form */}
      {showForm && isCutAdmin && (
        <div className="bg-slate-50 border border-slate-300 rounded-xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-1">
            {editingId ? 'Edit Academic Workshop' : 'Schedule New Workshop / Seminar'}
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Workshop sessions will be scheduled on the portal and featured for all CUT postgraduate scholars.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Workshop Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Mastering Scopus & Web of Science Article Structuring"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Facilitator / Guest Speaker</label>
                <input
                  type="text"
                  value={formData.facilitator}
                  onChange={(e) => setFormData({ ...formData, facilitator: e.target.value })}
                  placeholder="e.g. Prof. Khanyisile Mthembu & Senior Fellows"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Track / Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Academic Writing, Ethics, Methodology"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Time (SAST)</label>
                <input
                  type="text"
                  value={formData.eventTime}
                  onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                  placeholder="10:00"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Venue or Virtual Stream Link</label>
                <input
                  type="text"
                  value={formData.venueOrLink}
                  onChange={(e) => setFormData({ ...formData, venueOrLink: e.target.value })}
                  placeholder="Library Seminar Room 204, Bloemfontein Campus or MS Teams URL"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Abstract & Workshop Outline</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Topics, practical exercises, and outcomes..."
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white font-sans"
                  required
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
                {editingId ? 'Save Changes' : 'Publish Workshop'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Workshops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workshops.map((ws) => (
          <div
            key={ws.id}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-bold text-[#003261] uppercase tracking-wider">{ws.category}</span>
                <span className="text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded font-bold border border-amber-200">
                  {ws.eventDate}
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 mb-2 leading-snug">{ws.title}</h2>

              <div className="text-xs text-slate-600 space-y-1.5 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Facilitator: <b className="text-slate-800">{ws.facilitator}</b></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Time: <b>{ws.eventTime} SAST</b></span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-800 font-medium truncate">{ws.venueOrLink}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{ws.description}</p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                Open to All CUT Scholars
              </span>
              {isCutAdmin && (
                <button
                  onClick={() => handleStartEdit(ws)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded cursor-pointer flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" /> Edit (Admin)
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
