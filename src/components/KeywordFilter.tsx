import type { FilterMode } from '../types';

interface Props {
  value: string;
  onChange: (value: string) => void;
  mode: FilterMode;
  onModeChange: (mode: FilterMode) => void;
  totalCount: number;
  filteredCount: number;
  hasKeywords: boolean;
}

export function KeywordFilter({ value, onChange, mode, onModeChange, totalCount, filteredCount, hasKeywords }: Props) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Keywords</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. topological, superconductor, graphene"
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-oa-primary/30 focus:border-oa-primary"
      />
      {hasKeywords && (
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-md p-0.5">
            <button
              onClick={() => onModeChange('highlight')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                mode === 'highlight'
                  ? 'bg-white text-oa-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Highlight
            </button>
            <button
              onClick={() => onModeChange('filter')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                mode === 'filter'
                  ? 'bg-white text-oa-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Filter
            </button>
          </div>
          <span className="text-xs text-gray-500">
            {filteredCount} / {totalCount}
          </span>
        </div>
      )}
    </div>
  );
}
