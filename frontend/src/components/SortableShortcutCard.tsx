import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ShortcutCard } from "./ShortcutCard";
import type { SortableShortcutCardProps } from "../types";

/**
 * Sortable wrapper for ShortcutCard component
 */
export const SortableShortcutCard: React.FC<SortableShortcutCardProps> = (
  props
) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: props.shortcut.id,
  });

  // Only apply translate transform, not scale - prevents layout shifts
  const style: React.CSSProperties = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    transition: transition || "transform 200ms ease",
    // Keep the card in place while dragging (maintains grid layout)
    zIndex: isDragging ? 50 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative h-full"
    >
      {/* Placeholder - keeps space when dragging */}
      {isDragging && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-500/50 bg-blue-500/5 rounded-2xl sm:rounded-3xl pointer-events-none" />
      )}

      {/* Drop indicator - shows where card will land */}
      {isOver && !isDragging && (
        <div className="absolute inset-0 border-2 border-blue-500 bg-blue-500/20 rounded-2xl sm:rounded-3xl animate-pulse z-10 pointer-events-none" />
      )}

      <div className={`h-full ${isDragging ? "opacity-0" : "opacity-100"}`}>
        <ShortcutCard
          {...props}
          dragHandleProps={{ ...attributes, ...listeners }}
          isOver={isOver}
        />
      </div>
    </div>
  );
};
