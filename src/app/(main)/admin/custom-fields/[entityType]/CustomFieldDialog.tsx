'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { createCustomFieldDefinition, updateCustomFieldDefinition } from '@/features/custom-fields/actions/definition-actions';
import { toast } from 'sonner';
import type { CustomFieldDefinition, EntityType } from '@/types/domain';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'select', label: 'Select' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'date', label: 'Date' },
  { value: 'datetime', label: 'Date & Time' },
  { value: 'time', label: 'Time' },
];

interface CustomFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: EntityType;
  field?: CustomFieldDefinition | null;
  onSuccess: () => void;
}

export function CustomFieldDialog({
  open,
  onOpenChange,
  entityType,
  field,
  onSuccess,
}: CustomFieldDialogProps) {
  const [formData, setFormData] = useState({
    fieldKey: field?.fieldKey || '',
    label: field?.label || '',
    fieldType: (field?.fieldType || 'text') as any,
    placeholder: field?.placeholder || '',
    helpText: field?.helpText || '',
    section: field?.section || '',
    required: field?.required || false,
    order: field?.order || 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fieldKey || !formData.label) {
      toast.error('Field key and label are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = field
        ? await updateCustomFieldDefinition(field.id, formData)
        : await createCustomFieldDefinition({
            ...formData,
            entityType,
          });

      if (result.success) {
        toast.success(field ? 'Field updated successfully' : 'Field created successfully');
        onSuccess();
      } else {
        toast.error(result.error || 'Failed to save field');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{field ? 'Edit' : 'Add'} Custom Field</DialogTitle>
          <DialogDescription>
            {field ? 'Update the field configuration' : 'Add a new custom field to extend your forms'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Field Key */}
          <div className="space-y-2">
            <Label htmlFor="fieldKey">
              Field Key <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fieldKey"
              value={formData.fieldKey}
              onChange={(e) => setFormData(prev => ({ ...prev, fieldKey: e.target.value }))}
              placeholder="certificationNumber"
              required
              disabled={!!field} // Can't change key in edit mode
            />
            <p className="text-xs text-muted-foreground">
              Unique identifier (camelCase, no spaces). Cannot be changed after creation.
            </p>
          </div>

          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="label">
              Label <span className="text-destructive">*</span>
            </Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
              placeholder="Certification Number"
              required
            />
            <p className="text-xs text-muted-foreground">
              Display name shown in forms
            </p>
          </div>

          {/* Field Type */}
          <div className="space-y-2">
            <Label htmlFor="fieldType">
              Field Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.fieldType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, fieldType: value as any }))}
            >
              <SelectTrigger id="fieldType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Placeholder */}
          <div className="space-y-2">
            <Label htmlFor="placeholder">Placeholder</Label>
            <Input
              id="placeholder"
              value={formData.placeholder}
              onChange={(e) => setFormData(prev => ({ ...prev, placeholder: e.target.value }))}
              placeholder="Enter value..."
            />
          </div>

          {/* Help Text */}
          <div className="space-y-2">
            <Label htmlFor="helpText">Help Text</Label>
            <Textarea
              id="helpText"
              value={formData.helpText}
              onChange={(e) => setFormData(prev => ({ ...prev, helpText: e.target.value }))}
              placeholder="Additional instructions for users..."
              rows={2}
            />
          </div>

          {/* Section */}
          <div className="space-y-2">
            <Label htmlFor="section">Section</Label>
            <Input
              id="section"
              value={formData.section}
              onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
              placeholder="Additional Information"
            />
            <p className="text-xs text-muted-foreground">
              Group related fields together
            </p>
          </div>

          {/* Order */}
          <div className="space-y-2">
            <Label htmlFor="order">Display Order</Label>
            <Input
              id="order"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData(prev => ({ ...prev, order: Number(e.target.value) }))}
              min={0}
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers appear first
            </p>
          </div>

          {/* Required */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="required"
              checked={formData.required}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, required: !!checked }))}
            />
            <Label htmlFor="required" className="cursor-pointer font-normal">
              Required field
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : field ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
