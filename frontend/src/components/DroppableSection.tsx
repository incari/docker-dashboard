import React from "react";
import { useDroppable } from "@dnd-kit/core";
import type { DroppableSectionProps } from "../types";

/**
 * Droppable Section Wrapper - Makes entire section droppable
 */
export const DroppableSection: React.FC<DroppableSectionProps> = ({
  sectionId,
  isActive,
  children,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `section-${sectionId}`,
    data: {
      type: "section",
      sectionId: sectionId,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className="relative"
    >
      {/* Drop overlay - shows when dragging over the section */}
      {isActive && isOver && (
        <div className="absolute inset-0 border-4 border-blue-500 bg-blue-500/20 rounded-2xl pointer-events-none z-50 animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-blue-500 text-white px-8 py-4 rounded-xl font-bold shadow-2xl text-xl">
              ✓ Drop here
            </div>
          </div>
        </div>
      )}
      {/* Subtle border when dragging but not hovering over this section */}
      {isActive && !isOver && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-500/30 rounded-2xl pointer-events-none z-50"></div>
      )}
      {/* Children rendered normally - section adapts to content height */}
      <div className="min-h-[120px]">{children}</div>
    </div>
  );
};
