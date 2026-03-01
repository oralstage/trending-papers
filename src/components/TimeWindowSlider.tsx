import { useState, useEffect, useRef } from 'react';

interface Props {
  value: number;
  onChange: (months: number) => void;
}

const TICKS = [1, 3, 6, 12, 24, 36, 60];
const MIN = 1;
const MAX = 60;

function formatMonths(m: number): string {
  if (m < 12) return `${m}mo`;
  const years = m / 12;
  if (Number.isInteger(years)) return `${years}y`;
  return `${years.toFixed(1)}y`;
}

export function TimeWindowSlider({ value, onChange }: Props) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const handleChange = (v: number) => {
    setLocal(v);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(v), 500);
  };

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const pct = ((local - MIN) / (MAX - MIN)) * 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Time window</span>
        <span className="text-xs font-medium text-oa-primary">{formatMonths(local)}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={MIN}
          max={MAX}
          value={local}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-oa-primary [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10"
          style={{
            background: `linear-gradient(to right, #e16b31 0%, #e16b31 ${pct}%, #e5e7eb ${pct}%, #e5e7eb 100%)`,
          }}
        />
      </div>
      <div className="flex justify-between px-0.5">
        {TICKS.map((t) => (
          <button
            key={t}
            onClick={() => handleChange(t)}
            className={`text-[10px] transition-colors ${
              t === local ? 'text-oa-primary font-semibold' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {formatMonths(t)}
          </button>
        ))}
      </div>
    </div>
  );
}
