'use client';

/**
 * FORM BUILDER MAIN
 * Complete visual form builder with drag & drop
 */

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/shared/icons';
import { FieldPalette } from './FieldPalette';
import { FormCanvas } from './FormCanvas';
import { PropertyPanel } from './PropertyPanel';
import { FormSchema, JSONSchemaProperty } from '../../types/json-schema';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';

interface FormBuilderMainProps {
  initialSchema?: FormSchema;
  onSave?: (schema: FormSchema) => void;
  onPreview?: (schema: FormSchema) => void;
}

interface BuilderField {
  id: string;
  type: string;
  icon: string;
  label: string;
  required: boolean;
  schema: JSONSchemaProperty;
}

export function FormBuilderMain({ initialSchema, onSave, onPreview }: FormBuilderMainProps) {
  const [formTitle, setFormTitle] = useState(initialSchema?.title || 'New Form');
  const [formDescription, setFormDescription] = useState(initialSchema?.description || '');
  const [fields, setFields] = useState<BuilderField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Adding new field from palette
    if (active.id.toString().startsWith('palette-')) {
      const fieldTemplate = active.data.current?.fieldTemplate;
      if (!fieldTemplate) return;

      const newField: BuilderField = {
        id: nanoid(),
        type: fieldTemplate.type,
        icon: fieldTemplate.icon,
        label: fieldTemplate.label,
        required: false,
        schema: {
          ...fieldTemplate.defaultSchema,
          title: fieldTemplate.label,
        },
      };

      if (over.id === 'form-canvas') {
        setFields([...fields, newField]);
        setSelectedFieldId(newField.id);
        toast.success(`Added ${fieldTemplate.label} field`);
      }
    }
    // Reordering fields
    else if (active.id !== over.id) {
      setFields((fields) => {
        const oldIndex = fields.findIndex((f) => f.id === active.id);
        const newIndex = fields.findIndex((f) => f.id === over.id);
        return arrayMove(fields, oldIndex, newIndex);
      });
    }
  };

  const handleRemoveField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
    if (selectedFieldId === id) {
      setSelectedFieldId(null);
    }
    toast.success('Field removed');
  };

  const handleUpdateField = (id: string, updates: Partial<BuilderField>) => {
    setFields(
      fields.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const handleSave = () => {
    const schema: FormSchema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: formTitle,
      description: formDescription,
      type: 'object',
      properties: {},
      required: [],
    };

    fields.forEach((field) => {
      const fieldKey = field.schema.title?.toLowerCase().replace(/\s+/g, '_') || field.id;
      schema.properties[fieldKey] = field.schema;
      
      if (field.required) {
        schema.required?.push(fieldKey);
      }
    });

    onSave?.(schema);
    toast.success('Form saved successfully!');
  };

  const handlePreview = () => {
    const schema: FormSchema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: formTitle,
      description: formDescription,
      type: 'object',
      properties: {},
      required: [],
    };

    fields.forEach((field) => {
      const fieldKey = field.schema.title?.toLowerCase().replace(/\s+/g, '_') || field.id;
      schema.properties[fieldKey] = field.schema;
      
      if (field.required) {
        schema.required?.push(fieldKey);
      }
    });

    onPreview?.(schema);
  };

  const handleExportJSON = () => {
    const schema: FormSchema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: formTitle,
      description: formDescription,
      type: 'object',
      properties: {},
      required: [],
    };

    fields.forEach((field) => {
      const fieldKey = field.schema.title?.toLowerCase().replace(/\s+/g, '_') || field.id;
      schema.properties[fieldKey] = field.schema;
      
      if (field.required) {
        schema.required?.push(fieldKey);
      }
    });

    const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formTitle.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    toast.success('JSON Schema exported!');
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId) || null;

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between max-w-full">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="text-2xl font-bold bg-transparent border-none outline-none w-full"
              placeholder="Form Title"
            />
            <input
              type="text"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="text-sm text-muted-foreground bg-transparent border-none outline-none w-full mt-1"
              placeholder="Form description (optional)"
            />
          </div>

          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm text-muted-foreground">
              {fields.length} {fields.length === 1 ? 'field' : 'fields'}
            </span>
            <Button variant="outline" size="sm" onClick={handleExportJSON}>
              <Icons.FileDown className="size-4 mr-2" />
              Export JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handlePreview}>
              <Icons.Eye className="size-4 mr-2" />
              Preview
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Icons.Save className="size-4 mr-2" />
              Save Form
            </Button>
          </div>
        </div>
      </div>

      {/* Main Builder */}
      <div className="flex-1 overflow-hidden">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-[280px_1fr_320px] h-full gap-4 p-4">
            {/* Left: Field Palette */}
            <FieldPalette />

            {/* Center: Canvas */}
            <FormCanvas
              fields={fields}
              selectedFieldId={selectedFieldId}
              onSelectField={setSelectedFieldId}
              onRemoveField={handleRemoveField}
            />

            {/* Right: Properties */}
            <PropertyPanel
              field={selectedField}
              onUpdate={handleUpdateField}
            />
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeId && activeId.startsWith('palette-') && (
              <div className="p-3 rounded-lg border-2 border-primary bg-background shadow-lg">
                <div className="font-medium">Dragging field...</div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
