import React from 'react';
import { PackageType, ServiceStatus } from '../../types';
import { Terminal, Box, RefreshCw, Pin, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface StatusBadgeProps {
  type?: PackageType | 'outdated' | 'pinned' | 'service' | 'tap' | 'verified';
  serviceStatus?: ServiceStatus;
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  type, 
  serviceStatus, 
  label,
  size = 'sm' 
}) => {
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-[11px] font-medium' 
    : 'px-2.5 py-1 text-xs font-medium';

  if (type === 'formula') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-md bg-[#333333] text-orange-400 border border-[#444444] ${sizeClasses}`}>
        <Terminal className="w-3 h-3" />
        {label || 'Formula'}
      </span>
    );
  }

  if (type === 'cask') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-md bg-[#333333] text-blue-400 border border-[#444444] ${sizeClasses}`}>
        <Box className="w-3 h-3" />
        {label || 'Cask'}
      </span>
    );
  }

  if (type === 'outdated') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-md bg-rose-950/50 text-rose-400 border border-rose-800/40 ${sizeClasses}`}>
        <RefreshCw className="w-3 h-3 animate-spin-slow" />
        {label || 'Update Available'}
      </span>
    );
  }

  if (type === 'pinned') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-md bg-purple-950/50 text-purple-400 border border-purple-800/40 ${sizeClasses}`}>
        <Pin className="w-3 h-3" />
        {label || 'Pinned'}
      </span>
    );
  }

  if (type === 'verified') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-md bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 ${sizeClasses}`}>
        <ShieldCheck className="w-3 h-3" />
        {label || 'Verified Bottle'}
      </span>
    );
  }

  if (type === 'service' || serviceStatus) {
    const isStarted = serviceStatus === 'started';
    const isError = serviceStatus === 'error';
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full ${
        isStarted 
          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50' 
          : isError
          ? 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
          : 'bg-[#333333] text-[#888888] border border-[#444444]'
      } ${sizeClasses}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${
          isStarted ? 'bg-emerald-400 animate-pulse' : isError ? 'bg-rose-400' : 'bg-[#666666]'
        }`} />
        {label || (isStarted ? 'Running' : isError ? 'Error' : 'Stopped')}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-md bg-[#333333] text-[#CCCCCC] border border-[#444444] ${sizeClasses}`}>
      {label}
    </span>
  );
};
