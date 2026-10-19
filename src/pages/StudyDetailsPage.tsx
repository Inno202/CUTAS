import React, { useState } from 'react';
import { User, StudyDetails } from '../types';
import { PageHeader, PageHeaderButton } from '../components/PageHeader';
import { FileDown, Edit3, Save, CheckCircle, GraduationCap } from 'lucide-react';

interface StudyDetailsPageProps {
  currentUser: User;
  studyDetails: StudyDetails;
  onUpdateStudyDetails: (updated: StudyDetails) => void;
  onDownloadPdf: () => void;
}

export const StudyDetailsPage: React.FC<StudyDetailsPageProps> = ({
  currentUser,
  studyDetails,
  onUpdateStudyDetails,
  onDownloadPdf,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<StudyDetails>({ ...studyDetails });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Year') ? parseInt(value) || 0 : value
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStudyDetails(formData);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        eyebrow="Academic Enrolment & Supervision"
        title="Details on Your Studies"
        description="Official postgraduate degree records, supervisory arrangements, research topic, and funding status."
        actions={
          <PageHeaderButton
            variant="primary"
            onClick={onDownloadPdf}
            icon={<FileDown className="w-4 h-4 text-[#FDB813]" />}
          >
            Download Study Dossier (PDF)
          </PageHeaderButton>
        }
      />

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Study records updated and synced to CUTAS institutional database.</span>
        </div>
      )}

      {/* Main Dossier Card */}
      <div className="bg-white rounded-[6px] border border-[#E2E8F0] p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between pb-6 border-b border-slate-200">
          <div>
            <span className="text-[11px] font-bold text-[#255190] uppercase tracking-wider block">
              Enrolled Postgraduate Scholar
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              {currentUser.title} {currentUser.firstName} {currentUser.lastName}
            </h2>
            <div className="text-xs text-slate-500 mt-0.5">
              Student ID: {currentUser.studentNumber} · {currentUser.faculty}
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditing ? 'Cancel Editing' : 'Update Details'}
          </button>
        </div>

        {isEditing ? (
          /* Edit Form */
          <form onSubmit={handleSave} className="py-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Academic Programme</label>
                <input
                  type="text"
                  name="programme"
                  value={formData.programme}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">University / Institution</label>
                <input
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Commencement Year</label>
                <input
                  type="number"
                  name="yearOfStarting"
                  value={formData.yearOfStarting}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Anticipated Completion Year</label>
                <input
                  type="number"
                  name="anticipatedYearOfCompletion"
                  value={formData.anticipatedYearOfCompletion}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Primary Supervisor</label>
                <input
                  type="text"
                  name="supervisor"
                  value={formData.supervisor}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Co-Supervisor (if applicable)</label>
                <input
                  type="text"
                  name="coSupervisor"
                  value={formData.coSupervisor || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Funding Mechanism / Bursary</label>
                <input
                  type="text"
                  name="funding"
                  value={formData.funding}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Approved Research Topic</label>
                <input
                  type="text"
                  name="researchTopic"
                  value={formData.researchTopic}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Research Abstract & Methodology</label>
                <textarea
                  name="researchAbstract"
                  rows={6}
                  value={formData.researchAbstract}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white font-sans"
                  required
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#255190] text-white rounded-[4px] text-xs font-semibold hover:bg-[#183765] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" /> Save Changes
              </button>
            </div>
          </form>
        ) : (
          /* View Display */
          <div className="py-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                  Academic Programme
                </span>
                <span className="text-sm font-semibold text-slate-900 block mt-1">
                  {studyDetails.programme}
                </span>
              </div>

              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                  University
                </span>
                <span className="text-sm font-semibold text-slate-900 block mt-1">
                  {studyDetails.university}
                </span>
              </div>

              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                  Registration Timeline
                </span>
                <span className="text-xs text-slate-800 block mt-1">
                  Commenced: <b>{studyDetails.yearOfStarting}</b> · Anticipated Completion: <b>{studyDetails.anticipatedYearOfCompletion}</b>
                </span>
              </div>

              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                  Supervisory Advisory Team
                </span>
                <span className="text-xs text-slate-800 block mt-1">
                  <b>{studyDetails.supervisor}</b>
                  {studyDetails.coSupervisor && ` · Co: ${studyDetails.coSupervisor}`}
                </span>
              </div>

              <div className="sm:col-span-2">
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                  Funding
                </span>
                <span className="text-xs font-semibold text-emerald-800 block mt-1 bg-emerald-50 p-2.5 rounded-[4px] border border-emerald-200">
                  {studyDetails.funding}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px] mb-1">
                Approved Research Topic
              </span>
              <h3 className="text-base font-bold text-[#255190] leading-snug">
                {studyDetails.researchTopic}
              </h3>
            </div>

            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px] mb-2">
                Research Abstract & Methodology Outline
              </span>
              <div className="p-4 bg-slate-50 rounded-[4px] border border-[#E2E8F0] text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {studyDetails.researchAbstract}
              </div>
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Central University of Technology Postgraduate Research Records</span>
        </div>
      </div>
    </div>
  );
};
