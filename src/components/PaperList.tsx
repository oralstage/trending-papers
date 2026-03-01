import type { PaperWithS2 } from '../types';
import { PaperCard } from './PaperCard';

interface Props {
  papers: PaperWithS2[];
  s2Loading: boolean;
  onToggleBookmark: (id: string) => void;
}

export function PaperList({ papers, s2Loading, onToggleBookmark }: Props) {
  if (papers.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p>No papers found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {papers.map((paper) => (
        <PaperCard
          key={paper.openAlexId}
          paper={paper}
          s2Loading={s2Loading}
          onToggleBookmark={onToggleBookmark}
        />
      ))}
    </div>
  );
}
