import React, { useState } from 'react';
import { User, ScholarCategory } from '../types';
import { PageHeader } from '../components/PageHeader';
import { Shield, Eye, Lock, GraduationCap, X, CheckCircle, FileText } from 'lucide-react';

interface ScholarsPageProps {
  scholars: User[];
  currentUser: User | null;
}

export const ScholarsPage: React.FC<ScholarsPageProps> = ({ scholars, currentUser }) => {
  const [selectedCategory, setSelectedCategory] = useState<ScholarCategory | 'ALL'>('ALL');
  const [viewingCvUser, setViewingCvUser] = useState<User | null>(null);

  const filteredScholars = scholars.filter((s) => {
    if (selectedCategory === 'ALL') return true;
    return s.category === selectedCategory;
  });

  const catACount = scholars.filter(s => s.category === 'CAT_A').length;
  const catBCount = scholars.filter(s => s.category === 'CAT_B').length;
  const catCCount = scholars.filter(s => s.category === 'CAT_C').length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CUT Postgraduate Cohort"
        title="Scholars Directory"
        description="Registered postgraduate researchers grouped across academic categories at Central University of Technology."
      />

      {/* Category Filter Tabs (Category A, Category B, Category C) */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-[6px] max-w-2xl border border-slate-200">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`flex-1 min-w-[120px] text-center py-2 px-3 text-xs font-semibold rounded-[4px] transition-all cursor-pointer ${
            selectedCategory === 'ALL'
              ? 'bg-white text-[#255190] shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Scholars ({scholars.length})
        </button>
        <button
          onClick={() => setSelectedCategory('CAT_A')}
          className={`flex-1 min-w-[140px] text-center py-2 px-3 text-xs font-semibold rounded-[4px] transition-all cursor-pointer ${
            selectedCategory === 'CAT_A'
              ? 'bg-white text-[#255190] shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Category A ({catACount})
        </button>
        <button
          onClick={() => setSelectedCategory('CAT_B')}
          className={`flex-1 min-w-[140px] text-center py-2 px-3 text-xs font-semibold rounded-[4px] transition-all cursor-pointer ${
            selectedCategory === 'CAT_B'
              ? 'bg-white text-[#255190] shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Category B ({catBCount})
        </button>
        <button
          onClick={() => setSelectedCategory('CAT_C')}
          className={`flex-1 min-w-[140px] text-center py-2 px-3 text-xs font-semibold rounded-[4px] transition-all cursor-pointer ${
            selectedCategory === 'CAT_C'
              ? 'bg-white text-[#255190] shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Category C ({catCCount})
        </button>
      </div>

      {/* Category Definitions Banner */}
      <div className="bg-amber-50/60 border border-amber-200/80 rounded-[4px] p-3 text-xs text-amber-900">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span><b>Cat A:</b> Doctoral Candidates / Senior Fellows</span>
          <span>·</span>
          <span><b>Cat B:</b> Master’s Scholars & Researchers</span>
          <span>·</span>
          <span><b>Cat C:</b> Honours & Early Postgrads</span>
        </div>
      </div>

      {/* Scholars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredScholars.map((scholar) => (
          <div
            key={scholar.id}
            className="bg-white rounded-[6px] border border-[#E2E8F0] p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start space-x-4 mb-4">
                {/* Profile Picture / Monogram */}
                <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center font-bold text-lg text-[#255190] overflow-hidden shadow-inner">
                  {scholar.firstName[0]}{scholar.lastName[0]}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#255190] block">
                    {scholar.category ? scholar.category.replace('_', ' ') : 'Scholar'}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 truncate">
                    {scholar.title} {scholar.firstName} {scholar.lastName}
                  </h3>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{scholar.faculty}</p>
                  {scholar.department && (
                    <p className="text-[11px] text-slate-400 truncate">{scholar.department}</p>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                {scholar.bio}
              </p>
            </div>

            {/* Bottom Actions: View CV in Modal (strictly NO download button) */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">ID: {scholar.studentNumber}</span>
              <button
                onClick={() => setViewingCvUser(scholar)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-blue-50 text-[#255190] font-semibold rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[#255190]" />
                View Short CV
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Protected In-Portal CV Modal (Cannot be downloaded by others) */}
      {viewingCvUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[6px] shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="bg-[#255190] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#FDB813]">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-[#FDB813]" />
                <div>
                  <h3 className="text-base font-bold">
                    Curriculum Vitae: {viewingCvUser.title} {viewingCvUser.firstName} {viewingCvUser.lastName}
                  </h3>
                  <div className="text-[11px] text-amber-200">
                    {viewingCvUser.category ? viewingCvUser.category.replace('_', ' ') : 'Scholar'} · {viewingCvUser.faculty}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingCvUser(null)}
                className="p-1 text-slate-300 hover:text-white rounded-[4px] hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-800">
              {/* Institutional Notice */}
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-[4px] text-amber-900 text-[11px] flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span>
                  <b>Institutional POPIA Privacy Notice:</b> Scholar CVs are presented in-portal for verified academic collaboration only. In accordance with CUTAS regulations, downloadable copies are restricted.
                </span>
              </div>

              {/* Scholar Header */}
              <div className="flex items-start space-x-4 pb-4 border-b border-slate-200">
                <div className="w-14 h-14 rounded-full bg-[#255190] text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {viewingCvUser.firstName[0]}{viewingCvUser.lastName[0]}
                </div>
                <div>
                  <div className="font-bold text-base text-slate-900">
                    {viewingCvUser.title} {viewingCvUser.firstName} {viewingCvUser.lastName}
                  </div>
                  <div className="text-slate-600">{viewingCvUser.faculty}</div>
                  <div className="text-slate-500">{viewingCvUser.department}</div>
                  <div className="text-slate-400 mt-0.5">Student / Staff Ref: {viewingCvUser.studentNumber}</div>
                </div>
              </div>

              {/* Biography */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#255190] mb-2">
                  Scholarly Biography
                </h4>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-[4px] border border-[#E2E8F0]">
                  {viewingCvUser.bio}
                </p>
              </div>

              {/* CV Summary Content */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#255190] mb-2">
                  Academic Credentials & Research Track
                </h4>
                <div className="bg-slate-50 p-4 rounded-[4px] border border-[#E2E8F0] font-sans text-xs leading-relaxed text-slate-800 whitespace-pre-line">
                  {viewingCvUser.cvSummaryText}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" /> Authenticated CUT Scholar
              </span>
              <button
                onClick={() => setViewingCvUser(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-[4px] transition-colors cursor-pointer"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
