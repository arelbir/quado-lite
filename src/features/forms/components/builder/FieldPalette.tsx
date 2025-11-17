'use client';

/**
 * FIELD PALETTE
 * Draggable field types for form builder
 */

import { useDraggable } from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/shared/icons';
import { fieldTemplates, getFieldCategories } from '../../lib/field-templates';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

export function FieldPalette() {
  const [search, setSearch] = useState('');
  const categories = getFieldCategories();

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold mb-3">Field Types</h3>
        <Input
          placeholder="Search fields..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9"
        />
      </div>

      <Tabs defaultValue="basic" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b h-auto p-0">
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="rounded-none capitalize"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="flex-1 m-0">
            <ScrollArea className="h-full">
              <div className="p-2 space-y-1">
                {fieldTemplates
                  .filter((f) => f.category === category)
                  .filter((f) =>
                    search
                      ? f.label.toLowerCase().includes(search.toLowerCase()) ||
                        f.description.toLowerCase().includes(search.toLowerCase())
                      : true
                  )
                  .map((field) => (
                    <DraggableFieldItem key={field.id} field={field} />
                  ))}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}

function DraggableFieldItem({ field }: { field: any }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${field.id}`,
    data: {
      type: 'field-template',
      fieldTemplate: field,
    },
  });

  const IconComponent = (Icons as any)[field.icon] || Icons.Square;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-3 rounded-lg border-2 border-dashed cursor-move hover:border-primary hover:bg-accent transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        <IconComponent className="size-4 mt-0.5 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{field.label}</div>
          <div className="text-xs text-muted-foreground line-clamp-2">
            {field.description}
          </div>
        </div>
      </div>
    </div>
  );
}
