import React from 'react';
import { Check } from 'lucide-react';

export const VerifiedBadge = ({ isVerified, size = 'md' }) => {
  if (!isVerified) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-pill border tracking-micro uppercase ${
        size === 'sm'
          ? 'px-1.5 py-0.5 text-[10px]'
          : 'px-2 py-0.5 text-[11px]'
      } bg-[#F0FDFA] text-[#0F766E] border-[#99F6E4]`}
      title="Officially Verified Collegiate Credential"
    >
      <span className="w-3.5 h-3.5 rounded-full bg-[#0D9488] text-white flex items-center justify-center">
        <Check className="w-2.5 h-2.5 stroke-[3]" />
      </span>
      <span>Verified Alumni</span>
    </span>
  );
};
