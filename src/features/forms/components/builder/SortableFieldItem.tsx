'use client';

/**
 * SORTABLE FIELD ITEM
 * Individual field in the canvas (sortable)
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/shared/icons';
import { Badge } from '@/components/ui/badge';

interface SortableFieldItemProps {
  field: any;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

export function SortableFieldItem({
  field,
  isSelected,
  onSelect,
  onRemove,
}: SortableFieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const IconComponent = (Icons as any)[field.icon] || Icons.Square;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-4 cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary' : ''
      } ${isDragging ? 'opacity-50' : ''}`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground mt-1"
        >
          <Icons.Menu className="size-5" />
        </button>

        {/* Field Icon */}
        <IconComponent className="size-5 mt-1 text-muted-foreground" />

        {/* Field Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{field.schema.title || 'Untitled Field'}</span>
            <Badge variant="outline" className="text-xs">
              {field.type}
            </Badge>
          </div>
          {field.schema.description && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {field.schema.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            {field.schema['ui:widget'] && (
              <span>Widget: {field.schema['ui:widget']}</span>
            )}
            {field.required && (
              <Badge variant="destructive" className="text-xs">Required</Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="size-8"
          >
            <Icons.Trash className="size-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
