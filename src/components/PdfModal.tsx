import React from 'react';
import { X, Printer, Download, CheckCircle2 } from 'lucide-react';
import crestImage from '../assets/images/cutas_society_crest_1792291983112.jpg';

export interface PdfDocumentData {
  title: string;
  subtitle: string;
  scholarName?: string;
  dateGenerated: string;
  sections: {
    heading?: string;
    fields?: { label: string; value: string | React.ReactNode }[];
    table?: {
      headers: string[];
      rows: (string | number | React.ReactNode)[][];
    };
    content?: string;
  }[];
}

interface PdfModalProps {
  document: PdfDocumentData | null;
  onClose: () => void;
}

export const PdfModal: React.FC<PdfModalProps> = ({ document, onClose }) => {
  if (!document) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden my-4 sm:my-8 border border-slate-300 flex flex-col max-h-[92vh]">
        {/* Modal Toolbar (hidden during print) */}
        <div className="bg-[#003261] text-white px-4 sm:px-6 py-3 sm:py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 no-print border-b-2 border-[#FBB927] flex-shrink-0">
          <div className="flex items-center space-x-2 min-w-0">
            <span className="text-[10px] sm:text-xs uppercase font-bold text-[#FBB927] tracking-wider flex-shrink-0">Official Academic Document</span>
            <span className="text-slate-400 hidden sm:inline">·</span>
            <span className="text-xs text-slate-200 truncate hidden sm:inline">{document.title}</span>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#FBB927] hover:bg-amber-400 text-slate-900 font-bold text-xs rounded flex items-center gap-1.5 shadow transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close document"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Academic Letterhead Body */}
        <div className="p-4 sm:p-8 md:p-12 overflow-y-auto text-slate-900 bg-white space-y-6 print:p-0 print:m-0 font-sans">
          {/* Institutional Header */}
          <div className="flex items-start justify-between border-b-2 border-[#003261] pb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded bg-white p-1 border border-slate-200 shadow-sm flex items-center justify-center">
                <img
                  src={crestImage}
                  alt="CUTAS Crest"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#003261] uppercase tracking-wider block">
                  Central University of Technology, Free State
                </span>
                <h1 className="text-xl font-extrabold text-[#003261] tracking-tight">
                  Central University of Technology Academic Society (CUTAS)
                </h1>
                <p className="text-xs text-slate-500 italic mt-0.5">
                  "Bringing back intellectualism within the corridors of Higher Education"
                </p>
              </div>
            </div>

            <div className="text-right text-xs text-slate-500 space-y-0.5">
              <div className="font-semibold text-slate-800">Postgraduate Academic Dossier</div>
              <div>Date: {document.dateGenerated}</div>
              <div className="text-[10px] text-emerald-700 font-bold flex items-center justify-end gap-1">
                <CheckCircle2 className="w-3 h-3" /> Digitally Verified
              </div>
            </div>
          </div>

          {/* Document Title & Subtitle */}
          <div className="pt-2">
            <h2 className="text-lg font-bold text-slate-900">{document.title}</h2>
            <p className="text-xs text-slate-600">{document.subtitle}</p>
            {document.scholarName && (
              <p className="text-xs text-slate-800 font-semibold mt-1">Scholar: {document.scholarName}</p>
            )}
          </div>

          {/* Document Sections */}
          <div className="space-y-6 text-xs">
            {document.sections.map((section, idx) => (
              <div key={idx} className="space-y-3">
                {section.heading && (
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#003261] border-b border-slate-200 pb-1">
                    {section.heading}
                  </h3>
                )}

                {section.fields && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    {section.fields.map((f, fIdx) => (
                      <div key={fIdx}>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">{f.label}</span>
                        <div className="text-xs font-medium text-slate-900 mt-0.5">{f.value}</div>
                      </div>
                    ))}
                  </div>
                )}

                {section.content && (
                  <div className="text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded border border-slate-200">
                    {section.content}
                  </div>
                )}

                {section.table && (
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[#003261] text-white uppercase text-[10px] tracking-wider font-bold">
                        <tr>
                          {section.table.headers.map((h, hIdx) => (
                            <th key={hIdx} className="px-3 py-2 border-r border-blue-900 last:border-none">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {section.table.rows.map((row, rIdx) => (
                          <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-3 py-2 text-slate-800 border-r border-slate-100 last:border-none">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Official Stamp & Signoff Block */}
          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
            <div>
              <div className="font-bold text-[#003261]">Central University of Technology Academic Society</div>
              <div>Directorate of Research Development & Postgraduate Studies</div>
              <div className="text-[10px] text-slate-400">Bloemfontein Campus · Welkom Campus</div>
            </div>

            <div className="border border-slate-300 rounded p-2 text-center text-[10px] w-48 bg-slate-50">
              <span className="font-bold text-slate-700 block uppercase">CUTAS Institutional Seal</span>
              <span className="text-emerald-700 font-semibold block">AUTHENTICATED RECORD</span>
              <span className="text-slate-400 block">{document.dateGenerated}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
