import { useState } from 'react';

interface Props {
  abstract: string;
}

export function AbstractToggle({ abstract }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  if (!abstract) return null;

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
      >
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        Abstract
      </button>
      {isOpen && (
        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
          {abstract}
        </p>
      )}
    </div>
  );
}
