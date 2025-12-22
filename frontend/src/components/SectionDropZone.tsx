import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { SectionDropZoneProps } from '../types';

/**
 * Droppable Zone Component for Empty Sections
 */
export const SectionDropZone: React.FC<SectionDropZoneProps> = ({ sectionId, isActive }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `section-${sectionId}`,
    data: {
      type: 'section',
      sectionId: sectionId,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[120px] rounded-2xl border-2 border-dashed transition-all duration-200 flex items-center justify-center ${
        isOver
          ? 'border-blue-500 bg-blue-500/20 scale-[1.02] shadow-lg shadow-blue-500/30 animate-pulse'
          : isActive
          ? 'border-blue-500/50 bg-blue-500/5'
          : 'border-white/10 bg-white/[0.02]'
      }`}
    >
      <div className="text-center">
        <div
          className={`text-sm font-semibold transition-colors ${
            isOver ? 'text-blue-400' : 'text-slate-500'
          }`}
        >
          {isOver ? '✓ Drop here' : 'Drop cards here'}
        </div>
      </div>
    </div>
  );
};

