import type { TrendingSubTab } from '../types';

interface Props {
  active: TrendingSubTab;
  onChange: (tab: TrendingSubTab) => void;
}

const TABS: { value: TrendingSubTab; label: string }[] = [
  { value: 'citations', label: 'Citations' },
  { value: 'velocity', label: 'Velocity' },
];

export function SubTabBar({ active, onChange }: Props) {
  return (
    <div className="inline-flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            active === tab.value
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
