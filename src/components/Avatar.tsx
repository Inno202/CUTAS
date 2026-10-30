import React, { useState } from 'react';

interface AvatarProps {
  name: string;
  initialsText: string;
  pictureUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  tone?: 'brand' | 'gold' | 'light';
  className?: string;
}

const SIZES = { sm: 'w-9 h-9 text-xs', md: 'w-12 h-12 text-sm', lg: 'w-14 h-14 text-base', xl: 'w-20 h-20 text-xl' };
const TONES = {
  brand: 'bg-[#255190] text-white',
  gold: 'bg-[#FDB813] text-slate-900',
  light: 'bg-slate-100 text-[#255190] border border-slate-200',
};

/** Profile picture (signed URL from the API) with an initials fallback. */
export const Avatar: React.FC<AvatarProps> = ({ name, initialsText, pictureUrl, size = 'md', tone = 'brand', className = '' }) => {
  const [failed, setFailed] = useState(false);
  const showImage = !!pictureUrl && !failed;
  return (
    <div
      className={`${SIZES[size]} rounded-full flex-shrink-0 flex items-center justify-center font-bold overflow-hidden shadow-xs ${
        showImage ? 'bg-slate-100' : TONES[tone]
      } ${className}`}
    >
      {showImage ? (
        <img
          src={pictureUrl!}
          alt={`Profile photo of ${name}`}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{initialsText}</span>
      )}
    </div>
  );
};
