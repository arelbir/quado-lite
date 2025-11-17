'use client';

/**
 * PROPERTY PANEL
 * Edit field properties
 */

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icons } from '@/components/shared/icons';
import { Separator } from '@/components/ui/separator';

interface PropertyPanelProps {
  field: any | null;
  onUpdate: (fieldId: string, updates: any) => void;
}

export function PropertyPanel({ field, onUpdate }: PropertyPanelProps) {
  if (!field) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground p-8">
          <Icons.Settings className="size-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No Field Selected</p>
          <p className="text-sm">Click on a field to edit its properties</p>
        </div>
      </Card>
    );
  }

  const handleChange = (path: string, value: any) => {
    const updates = { ...field };
    const keys = path.split('.');
    let current: any = updates;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (key && !current[key]) {
        current[key] = {};
      }
      if (key) {
        current = current[key];
      }
    }

    const lastKey = keys[keys.length - 1];
    if (lastKey && current) {
      current[lastKey] = value;
    }
    onUpdate(field.id, updates);
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Field Properties</h3>
        <p className="text-sm text-muted-foreground">{field.type}</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Basic Properties */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Basic</h4>
            
            <div className="space-y-2">
              <Label htmlFor="field-title">Label</Label>
              <Input
                id="field-title"
                value={field.schema.title || ''}
                onChange={(e) => handleChange('schema.title', e.target.value)}
                placeholder="Field Label"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="field-description">Description</Label>
              <Input
                id="field-description"
                value={field.schema.description || ''}
                onChange={(e) => handleChange('schema.description', e.target.value)}
                placeholder="Optional description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="field-placeholder">Placeholder</Label>
              <Input
                id="field-placeholder"
                value={field.schema['ui:options']?.placeholder || ''}
                onChange={(e) => handleChange('schema.ui:options.placeholder', e.target.value)}
                placeholder="Placeholder text"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="field-help">Help Text</Label>
              <Textarea
                id="field-help"
                value={field.schema['ui:options']?.help || ''}
                onChange={(e) => handleChange('schema.ui:options.help', e.target.value)}
                placeholder="Help text for users"
                rows={2}
              />
            </div>
          </div>

          <Separator />

          {/* Validation */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Validation</h4>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="field-required" className="cursor-pointer">Required Field</Label>
              <Switch
                id="field-required"
                checked={field.required || false}
                onCheckedChange={(checked) => handleChange('required', checked)}
              />
            </div>

            {field.schema.type === 'string' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="field-minlength">Min Length</Label>
                  <Input
                    id="field-minlength"
                    type="number"
                    value={field.schema.minLength || ''}
                    onChange={(e) => handleChange('schema.minLength', parseInt(e.target.value) || undefined)}
                    placeholder="Minimum length"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="field-maxlength">Max Length</Label>
                  <Input
                    id="field-maxlength"
                    type="number"
                    value={field.schema.maxLength || ''}
                    onChange={(e) => handleChange('schema.maxLength', parseInt(e.target.value) || undefined)}
                    placeholder="Maximum length"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="field-pattern">Pattern (Regex)</Label>
                  <Input
                    id="field-pattern"
                    value={field.schema.pattern || ''}
                    onChange={(e) => handleChange('schema.pattern', e.target.value)}
                    placeholder="Regular expression"
                  />
                </div>
              </>
            )}

            {(field.schema.type === 'number' || field.schema.type === 'integer') && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="field-minimum">Minimum Value</Label>
                  <Input
                    id="field-minimum"
                    type="number"
                    value={field.schema.minimum || ''}
                    onChange={(e) => handleChange('schema.minimum', parseFloat(e.target.value) || undefined)}
                    placeholder="Minimum value"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="field-maximum">Maximum Value</Label>
                  <Input
                    id="field-maximum"
                    type="number"
                    value={field.schema.maximum || ''}
                    onChange={(e) => handleChange('schema.maximum', parseFloat(e.target.value) || undefined)}
                    placeholder="Maximum value"
                  />
                </div>
              </>
            )}
          </div>

          <Separator />

          {/* Options (for select, radio, checkboxes) */}
          {(field.schema.enum || field.type === 'select' || field.type === 'radio') && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Options</h4>
              <p className="text-xs text-muted-foreground">
                Add options for selection fields (one per line)
              </p>
              <Textarea
                value={(field.schema.enum || []).join('\n')}
                onChange={(e) => {
                  const options = e.target.value.split('\n').filter(Boolean);
                  handleChange('schema.enum', options);
                  handleChange('schema.enumNames', options);
                }}
                placeholder="Option 1&#10;Option 2&#10;Option 3"
                rows={5}
              />
            </div>
          )}

          <Separator />

          {/* Advanced */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Advanced</h4>
            
            <div className="space-y-2">
              <Label htmlFor="field-default">Default Value</Label>
              <Input
                id="field-default"
                value={field.schema.default || ''}
                onChange={(e) => handleChange('schema.default', e.target.value)}
                placeholder="Default value"
              />
            </div>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
}
