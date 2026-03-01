import { useState, useEffect, useRef } from 'react';

interface Props {
  value: number;
  onChange: (months: number) => void;
}

// 7 equally-spaced stops on the slider, mapped to month values
const STOPS = [1, 3, 6, 12, 24, 36, 60];
const SLIDER_MAX = STOPS.length - 1; // 0..6

function positionToMonths(pos: number): number {
  const idx = Math.min(Math.floor(pos), STOPS.length - 2);
  const frac = pos - idx;
  return Math.round(STOPS[idx] + frac * (STOPS[idx + 1] - STOPS[idx]));
}

function monthsToPosition(months: number): number {
  for (let i = 0; i < STOPS.length - 1; i++) {
    if (months <= STOPS[i + 1]) {
      return i + (months - STOPS[i]) / (STOPS[i + 1] - STOPS[i]);
    }
  }
  return SLIDER_MAX;
}

function formatMonths(m: number): string {
  if (m < 12) return `${m}mo`;
  const years = m / 12;
  if (Number.isInteger(years)) return `${years}y`;
  return `${years.toFixed(1)}y`;
}

export function TimeWindowSlider({ value, onChange }: Props) {
  const [localPos, setLocalPos] = useState(() => monthsToPosition(value));
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setLocalPos(monthsToPosition(value));
  }, [value]);

  const handleSlide = (pos: number) => {
    setLocalPos(pos);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(positionToMonths(pos)), 500);
  };

  const handleTickClick = (months: number) => {
    const pos = monthsToPosition(months);
    setLocalPos(pos);
    clearTimeout(timerRef.current);
    onChange(months);
  };

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const displayMonths = positionToMonths(localPos);
  const pct = (localPos / SLIDER_MAX) * 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Time window</span>
        <span className="text-xs font-medium text-oa-primary">{formatMonths(displayMonths)}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={0}
          max={SLIDER_MAX}
          step={0.01}
          value={localPos}
          onChange={(e) => handleSlide(Number(e.target.value))}
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
        {STOPS.map((m) => (
          <button
            key={m}
            onClick={() => handleTickClick(m)}
            className={`text-[10px] transition-colors ${
              displayMonths === m ? 'text-oa-primary font-semibold' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {formatMonths(m)}
          </button>
        ))}
      </div>
    </div>
  );
}
