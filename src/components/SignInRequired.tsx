import React from 'react';
import { Lock } from 'lucide-react';
import { navigate } from '../router';
import type { TabId } from '../types';
import { btnPrimary, cardClass } from './ui';

export const SignInRequired: React.FC<{ next: TabId; message?: string }> = ({ next, message }) => (
  <div className={`${cardClass} p-8 text-center max-w-lg mx-auto my-8 sm:my-12`}>
    <Lock className="w-10 h-10 text-[#255190] mx-auto mb-3" aria-hidden="true" />
    <h1 className="text-lg font-semibold text-[#255190]">Sign in required</h1>
    <p className="text-xs text-slate-600 mt-2 leading-relaxed mx-auto">
      {message ?? 'Please sign in to your CUTAS account to view this page.'}
    </p>
    <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
      <button type="button" onClick={() => navigate('login', { next })} className={btnPrimary}>
        Sign in
      </button>
      <button
        type="button"
        onClick={() => navigate('register')}
        className="inline-flex items-center justify-center min-h-10 px-5 py-2 border border-[#255190] text-[#255190] rounded-[4px] text-xs font-semibold hover:bg-blue-50 cursor-pointer"
      >
        Register
      </button>
    </div>
  </div>
);

export const AccessDenied: React.FC<{ message?: string }> = ({ message }) => (
  <div className="bg-red-50 border border-red-200 text-red-900 p-8 rounded-[6px] text-center text-xs max-w-lg mx-auto my-8" role="alert">
    <h1 className="text-base font-bold mb-2 text-red-900">Access restricted</h1>
    <p className="mx-auto">{message ?? 'You do not have permission to view this page.'}</p>
  </div>
);
