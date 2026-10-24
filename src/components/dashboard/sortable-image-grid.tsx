import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { useState } from "react";

// ─── Single draggable image card ────────────────────────────────────────────
function SortableImageItem({
  url,
  index,
  onRemove,
}: {
  url: string;
  index: number;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: url });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative aspect-[4/5] rounded-xl overflow-hidden border border-border group bg-muted select-none"
    >
      <img
        src={url}
        alt={`Product view ${index + 1}`}
        className="w-full h-full object-cover pointer-events-none"
        draggable={false}
      />

      {/* Cover / index badge */}
      <span className="absolute left-2 top-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white pointer-events-none">
        {index === 0 ? "Cover" : `#${index + 1}`}
      </span>

      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute left-2 bottom-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      {/* Remove button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute right-2 top-2 p-1.5 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Remove image"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Overlay card shown while dragging ──────────────────────────────────────
function DragPreviewCard({ url }: { url: string }) {
  return (
    <div className="aspect-[4/5] w-[150px] rounded-xl overflow-hidden border-2 border-primary shadow-2xl rotate-2 opacity-95 bg-muted">
      <img
        src={url}
        alt="Dragging"
        className="w-full h-full object-cover pointer-events-none"
        draggable={false}
      />
    </div>
  );
}

// ─── Public component ────────────────────────────────────────────────────────
export interface SortableImageGridProps {
  images: string[];
  onChange: (reordered: string[]) => void;
  onRemove: (index: number) => void;
}

export function SortableImageGrid({
  images,
  onChange,
  onRemove,
}: SortableImageGridProps) {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // Require a small move before drag starts so click-to-remove still works
        distance: 8,
      },
    })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveUrl(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveUrl(null);
    if (!over || active.id === over.id) return;

    const oldIndex = images.indexOf(active.id as string);
    const newIndex = images.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    onChange(arrayMove(images, oldIndex, newIndex));
  }

  if (images.length === 0) {
    return (
      <div className="col-span-full py-8 text-center border-2 border-dashed border-border rounded-xl text-muted-foreground text-sm">
        No images added yet. Upload files or add an image URL above.
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={images} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((url, i) => (
            <SortableImageItem
              key={url}
              url={url}
              index={i}
              onRemove={() => onRemove(i)}
            />
          ))}
        </div>
      </SortableContext>

      {/* Ghost that follows the cursor */}
      <DragOverlay dropAnimation={null}>
        {activeUrl ? <DragPreviewCard url={activeUrl} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
