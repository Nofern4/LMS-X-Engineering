import React from 'react';
import { HardDrive } from 'lucide-react';
import { clsx } from 'clsx';

interface StorageProgressProps {
  usedGb: number;
  limitGb: number;
  className?: string;
}

export const StorageProgress: React.FC<StorageProgressProps> = ({
  usedGb,
  limitGb,
  className,
}) => {
  const percentage = Math.min(Math.round((usedGb / limitGb) * 100), 100);
  const remainingGb = Math.max(0, (limitGb - usedGb)).toFixed(1);

  const getBarColor = () => {
    if (percentage > 90) return 'bg-rose-500';
    if (percentage > 75) return 'bg-amber-500';
    return 'bg-brand-600';
  };

  return (
    <div className={clsx('p-4 bg-slate-50 rounded-xl border border-slate-200/80', className)}>
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
        <div className="flex items-center gap-1.5">
          <HardDrive className="w-4 h-4 text-brand-600" />
          <span>Course Storage Quota</span>
        </div>
        <span className="font-bold text-slate-900">{percentage}% Used</span>
      </div>

      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden mb-2">
        <div
          className={clsx('h-2.5 transition-all duration-300 rounded-full', getBarColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <span>{usedGb.toFixed(1)} GB / {limitGb} GB</span>
        <span>{remainingGb} GB Remaining</span>
      </div>
    </div>
  );
};
