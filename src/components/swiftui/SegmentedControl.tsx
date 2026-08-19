import React from 'react';

export interface SegmentOption<T extends string = string> {
  id: T;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  size = 'sm'
}: SegmentedControlProps<T>) {
  return (
    <div className="inline-flex p-0.5 rounded-lg bg-[#252525] border border-[#333333] select-none">
      {options.map(opt => {
        const isActive = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`relative flex items-center gap-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs'
            } ${
              isActive
                ? 'bg-[#3A3A3A] text-white font-semibold shadow-xs'
                : 'text-[#888888] hover:text-[#E0E0E0]'
            }`}
          >
            {opt.icon}
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#333333] text-[#AAAAAA]'
                }`}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
