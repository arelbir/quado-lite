'use client';

/**
 * FORM CANVAS
 * Drop zone for building forms
 */

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/shared/icons';
import { SortableFieldItem } from './SortableFieldItem';

interface FormCanvasProps {
  fields: any[];
  selectedFieldId: string | null;
  onSelectField: (id: string) => void;
  onRemoveField: (id: string) => void;
}

export function FormCanvas({
  fields,
  selectedFieldId,
  onSelectField,
  onRemoveField,
}: FormCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'form-canvas',
  });

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Form Builder</h3>
        <p className="text-sm text-muted-foreground">
          Drag fields from the left to build your form
        </p>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 p-4 overflow-y-auto ${
          isOver ? 'bg-accent/50' : ''
        }`}
      >
        {fields.length === 0 ? (
          <div className="h-full flex items-center justify-center border-2 border-dashed rounded-lg">
            <div className="text-center text-muted-foreground">
              <Icons.MousePointerClick className="size-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Drop fields here to start building</p>
              <p className="text-sm">Drag field types from the left panel</p>
            </div>
          </div>
        ) : (
          <SortableContext
            items={fields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {fields.map((field) => (
                <SortableFieldItem
                  key={field.id}
                  field={field}
                  isSelected={field.id === selectedFieldId}
                  onSelect={() => onSelectField(field.id)}
                  onRemove={() => onRemoveField(field.id)}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </Card>
  );
}
