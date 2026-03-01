import { useState } from 'react';
import { FIELD_GROUPS } from '../constants';
import type { TopicInfo } from '../types';

interface Props {
  selected: number[];
  onChange: (ids: number[]) => void;
  topicsBySubfield: Map<number, TopicInfo[]>;
  excludedTopics: Set<string>;
  onToggleExcludedTopic: (topicId: string) => void;
}

export function TopicSelector({ selected, onChange, topicsBySubfield, excludedTopics, onToggleExcludedTopic }: Props) {
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(() => {
    const groups = new Set<number>();
    for (const group of FIELD_GROUPS) {
      if (group.subfields.some((s) => selected.includes(s.id))) {
        groups.add(group.fieldId);
      }
    }
    return groups;
  });

  const [expandedSubfields, setExpandedSubfields] = useState<Set<number>>(new Set());

  const selectedSet = new Set(selected);

  const toggleGroup = (fieldId: number) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(fieldId)) next.delete(fieldId);
      else next.add(fieldId);
      return next;
    });
  };

  const toggleSubfieldExpand = (subfieldId: number) => {
    setExpandedSubfields((prev) => {
      const next = new Set(prev);
      if (next.has(subfieldId)) next.delete(subfieldId);
      else next.add(subfieldId);
      return next;
    });
  };

  const toggleSubfield = (id: number) => {
    if (selectedSet.has(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const toggleAllInField = (fieldId: number) => {
    const group = FIELD_GROUPS.find((g) => g.fieldId === fieldId);
    if (!group) return;
    const ids = group.subfields.map((s) => s.id);
    const allSelected = ids.every((id) => selectedSet.has(id));
    if (allSelected) {
      onChange(selected.filter((id) => !ids.includes(id)));
    } else {
      const newIds = ids.filter((id) => !selectedSet.has(id));
      onChange([...selected, ...newIds]);
    }
  };

  const clearAll = () => onChange([]);

  const selectedSubfields = FIELD_GROUPS.flatMap((g) =>
    g.subfields.filter((s) => selectedSet.has(s.id)),
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Topics</label>
        {selected.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {selectedSubfields.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedSubfields.map((s) => (
            <button
              key={s.id}
              onClick={() => toggleSubfield(s.id)}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-oa-primary/10 text-oa-primary hover:bg-oa-primary/20 transition-colors"
            >
              {s.name}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {/* Excluded topics chips */}
      {excludedTopics.size > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {[...excludedTopics].map((topicId) => {
            const topicName = [...topicsBySubfield.values()]
              .flat()
              .find((t) => t.id === topicId)?.name ?? topicId;
            return (
              <button
                key={topicId}
                onClick={() => onToggleExcludedTopic(topicId)}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                {topicName}
              </button>
            );
          })}
        </div>
      )}

      <div className="space-y-1">
        {FIELD_GROUPS.map((group) => {
          const expanded = expandedGroups.has(group.fieldId);
          const ids = group.subfields.map((s) => s.id);
          const selectedCount = ids.filter((id) => selectedSet.has(id)).length;
          const allSelected = selectedCount === ids.length;

          return (
            <div key={group.fieldId} className="border border-gray-100 rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = selectedCount > 0 && !allSelected; }}
                  onChange={() => toggleAllInField(group.fieldId)}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-oa-primary focus:ring-oa-primary/30 accent-oa-primary"
                />
                <button
                  onClick={() => toggleGroup(group.fieldId)}
                  className="flex-1 flex items-center justify-between text-sm font-medium text-gray-700"
                >
                  <span>{group.label}</span>
                  <div className="flex items-center gap-2">
                    {selectedCount > 0 && (
                      <span className="text-xs text-oa-primary bg-oa-primary/10 px-1.5 py-0.5 rounded-full">
                        {selectedCount}
                      </span>
                    )}
                    <svg
                      className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>

              {expanded && (
                <div className="px-3 pb-2 space-y-0.5">
                  {group.subfields.map((subfield) => {
                    const isSelected = selectedSet.has(subfield.id);
                    const topics = topicsBySubfield.get(subfield.id);
                    const isExpanded = expandedSubfields.has(subfield.id);
                    const excludedCount = topics
                      ? topics.filter((t) => excludedTopics.has(t.id)).length
                      : 0;

                    return (
                      <div key={subfield.id}>
                        <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSubfield(subfield.id)}
                            className="w-3.5 h-3.5 rounded border-gray-300 text-oa-primary focus:ring-oa-primary/30 accent-oa-primary"
                          />
                          <span className="text-sm text-gray-600 flex-1 cursor-pointer" onClick={() => toggleSubfield(subfield.id)}>
                            {subfield.name}
                          </span>
                          {isSelected && topics && topics.length > 0 && (
                            <button
                              onClick={() => toggleSubfieldExpand(subfield.id)}
                              className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {excludedCount > 0 && (
                                <span className="text-red-500">{excludedCount} hidden</span>
                              )}
                              <svg
                                className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          )}
                        </div>

                        {/* Topic-level checkboxes */}
                        {isSelected && isExpanded && topics && (
                          <div className="ml-7 pl-2 border-l border-gray-100 space-y-0.5 mt-0.5 mb-1">
                            {topics.map((topic) => (
                              <label
                                key={topic.id}
                                className="flex items-center gap-2 px-2 py-0.5 rounded hover:bg-gray-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={!excludedTopics.has(topic.id)}
                                  onChange={() => onToggleExcludedTopic(topic.id)}
                                  className="w-3 h-3 rounded border-gray-300 text-oa-primary focus:ring-oa-primary/30 accent-oa-primary"
                                />
                                <span className={`text-xs ${excludedTopics.has(topic.id) ? 'text-gray-400 line-through' : 'text-gray-500'}`}>
                                  {topic.name}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
