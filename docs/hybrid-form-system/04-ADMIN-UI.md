# 🎛️ STEP 4: ADMIN UI

**Phase:** Admin Interface  
**Duration:** 3-4 days  
**Dependencies:** React Components (Step 3)

---

## **🎯 OBJECTIVES:**

- Custom fields management page
- CRUD operations UI
- Field type selector
- Validation builder
- Field ordering (drag & drop)

---

## **📁 PAGE STRUCTURE:**

```
src/app/(main)/admin/custom-fields/
├── [entityType]/
│   ├── page.tsx                    (List page)
│   ├── CustomFieldsTable.tsx       (Table component)
│   └── CustomFieldDialog.tsx       (Add/Edit dialog)
└── layout.tsx
```

---

## **1️⃣ CUSTOM FIELDS LIST PAGE:**

```typescript
// src/app/(main)/admin/custom-fields/[entityType]/page.tsx

import { getCustomFieldDefinitions } from '@/server/actions/custom-field-definition-actions';
import { CustomFieldsTable } from './CustomFieldsTable';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import Link from 'next/link';

export default async function CustomFieldsPage({
  params,
}: {
  params: { entityType: string };
}) {
  const result = await getCustomFieldDefinitions(params.entityType.toUpperCase() as any);
  const fields = result.success && result.data ? result.data : [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Custom Fields - {params.entityType}
          </h1>
          <p className="text-muted-foreground">
            Add additional fields to {params.entityType.toLowerCase()} forms
          </p>
        </div>
      </div>

      {/* Table */}
      <CustomFieldsTable
        entityType={params.entityType.toUpperCase() as any}
        fields={fields}
      />
    </div>
  );
}
```

---

## **2️⃣ CUSTOM FIELDS TABLE:**

```typescript
// src/app/(main)/admin/custom-fields/[entityType]/CustomFieldsTable.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { CustomFieldDialog } from './CustomFieldDialog';
import { deleteCustomFieldDefinition, reorderCustomFields } from '@/server/actions/custom-field-definition-actions';
import { toast } from 'sonner';
import type { CustomFieldDefinition } from '@/lib/types';

export function CustomFieldsTable({
  entityType,
  fields,
}: {
  entityType: string;
  fields: CustomFieldDefinition[];
}) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null);

  const handleAdd = () => {
    setEditingField(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (field: CustomFieldDefinition) => {
    setEditingField(field);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will archive the field.')) return;

    const result = await deleteCustomFieldDefinition(id);
    if (result.success) {
      toast.success('Field archived');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to delete');
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={handleAdd}>
            <Icons.Plus className="size-4 mr-2" />
            Add Field
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Field Name</TableHead>
              <TableHead>Field Key</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Required</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field) => (
              <TableRow key={field.id}>
                <TableCell>{field.order}</TableCell>
                <TableCell className="font-medium">{field.label}</TableCell>
                <TableCell>
                  <code className="text-xs">{field.fieldKey}</code>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{field.fieldType}</Badge>
                </TableCell>
                <TableCell>{field.section || '-'}</TableCell>
                <TableCell>
                  {field.required ? (
                    <Icons.CheckCircle2 className="size-4 text-green-500" />
                  ) : (
                    <Icons.Circle className="size-4 text-gray-300" />
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(field)}
                    >
                      <Icons.Edit className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(field.id)}
                    >
                      <Icons.Trash className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CustomFieldDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        entityType={entityType}
        field={editingField}
        onSuccess={() => {
          router.refresh();
          setIsDialogOpen(false);
        }}
      />
    </>
  );
}
```

---

## **3️⃣ ADD/EDIT DIALOG:**

```typescript
// src/app/(main)/admin/custom-fields/[entityType]/CustomFieldDialog.tsx

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { createCustomFieldDefinition, updateCustomFieldDefinition } from '@/server/actions/custom-field-definition-actions';
import { toast } from 'sonner';
import type { CustomFieldDefinition } from '@/lib/types';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'select', label: 'Select' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'date', label: 'Date' },
  { value: 'file', label: 'File Upload' },
  { value: 'user-picker', label: 'User Picker' },
];

export function CustomFieldDialog({
  open,
  onOpenChange,
  entityType,
  field,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: string;
  field?: CustomFieldDefinition | null;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    fieldKey: field?.fieldKey || '',
    label: field?.label || '',
    fieldType: field?.fieldType || 'text',
    placeholder: field?.placeholder || '',
    helpText: field?.helpText || '',
    section: field?.section || '',
    required: field?.required || false,
    order: field?.order || 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = field
        ? await updateCustomFieldDefinition(field.id, formData)
        : await createCustomFieldDefinition({
            ...formData,
            entityType: entityType as any,
          });

      if (result.success) {
        toast.success(field ? 'Field updated' : 'Field created');
        onSuccess();
      } else {
        toast.error(result.error || 'Failed to save');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{field ? 'Edit' : 'Add'} Custom Field</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Field Key */}
          <div className="space-y-2">
            <Label htmlFor="fieldKey">Field Key *</Label>
            <Input
              id="fieldKey"
              value={formData.fieldKey}
              onChange={(e) => setFormData(prev => ({ ...prev, fieldKey: e.target.value }))}
              placeholder="certificationNumber"
              required
              disabled={!!field} // Can't change key in edit mode
            />
            <p className="text-xs text-muted-foreground">
              Unique identifier (camelCase, no spaces)
            </p>
          </div>

          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="label">Label *</Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
              placeholder="Certification Number"
              required
            />
          </div>

          {/* Field Type */}
          <div className="space-y-2">
            <Label htmlFor="fieldType">Field Type *</Label>
            <Select
              value={formData.fieldType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, fieldType: value }))}
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
              placeholder="Additional instructions..."
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
          </div>

          {/* Order */}
          <div className="space-y-2">
            <Label htmlFor="order">Display Order</Label>
            <Input
              id="order"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData(prev => ({ ...prev, order: Number(e.target.value) }))}
            />
          </div>

          {/* Required */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="required"
              checked={formData.required}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, required: !!checked }))}
            />
            <Label htmlFor="required" className="cursor-pointer">
              Required field
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## **✅ CHECKLIST:**

- [ ] Create list page
- [ ] Create table component
- [ ] Create add/edit dialog
- [ ] Add field ordering UI
- [ ] Add validation builder (optional)
- [ ] Test CRUD operations
- [ ] Add confirmation dialogs
- [ ] Add loading states

---

**Status:** ✅ Admin UI ready  
**Next:** [Form Integration](./05-FORM-INTEGRATION.md)
