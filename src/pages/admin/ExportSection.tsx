import React, { useState } from 'react';
import { CheckCircle2, Database, Lock } from 'lucide-react';
import { adminApi } from '../../api/endpoints';
import { Alert, Field, Spinner, btnPrimary, inputClass } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useAction } from '../../hooks/useAsync';
import { SectionCard } from './shared';

export const ExportSection: React.FC = () => {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [done, setDone] = useState(false);
  const run = useAction();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDone(false);
    const ok = await run.run(async () => {
      await adminApi.exportData(password, code.replace(/\s/g, ''));
      return true;
    });
    setPassword('');
    setCode('');
    if (ok) setDone(true);
  };

  return (
    <SectionCard title="Institutional Database Export" description="Full JSON snapshot of all CUTAS records for archiving or migration. Password hashes and two-factor secrets are never included.">
      <div className="p-4 sm:p-5 bg-amber-50/70 border border-amber-200 rounded-[6px] max-w-md space-y-3">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-xs"><Lock className="w-4 h-4 text-amber-700" /> Step-up authentication required</div>
        <p className="text-xs text-amber-800 leading-relaxed">
          Re-enter your password{user?.mfaEnabled ? ' and a fresh authenticator code' : ''} to download the export. The download is recorded in the audit log.
        </p>
        {done && <Alert type="success"><span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Export downloaded. Store it encrypted and delete it when no longer needed.</span></Alert>}
        {run.error && <Alert type="error">{run.errors.password || run.errors.code || run.error}</Alert>}
        <form onSubmit={submit} className="space-y-3 text-xs">
          <Field label="Super Administrator password" required>
            {(id) => <input id={id} type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />}
          </Field>
          {user?.mfaEnabled && (
            <Field label="Authenticator code" required>
              {(id) => <input id={id} type="text" inputMode="numeric" autoComplete="one-time-code" required maxLength={7} value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^\d ]/g, ''))} className={`${inputClass} font-mono tracking-widest`} />}
            </Field>
          )}
          <button type="submit" disabled={run.busy} className={`${btnPrimary} w-full`}>
            {run.busy ? <Spinner className="w-3.5 h-3.5" /> : <Database className="w-4 h-4 text-[#FDB813]" />} Verify & Download (.json)
          </button>
        </form>
      </div>
    </SectionCard>
  );
};
