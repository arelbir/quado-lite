'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/shared/icons';
import { CustomFieldDialog } from './CustomFieldDialog';
import { deleteCustomFieldDefinition } from '@/features/custom-fields/actions/definition-actions';
import { toast } from 'sonner';
import type { CustomFieldDefinition, EntityType } from '@/types/domain';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CustomFieldsTableProps {
  entityType: EntityType;
  initialFields: CustomFieldDefinition[];
}

export function CustomFieldsTable({ entityType, initialFields }: CustomFieldsTableProps) {
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

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Are you sure you want to archive "${label}"? This field will be hidden from forms.`)) {
      return;
    }

    const result = await deleteCustomFieldDefinition(id);
    if (result.success) {
      toast.success('Field archived successfully');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to archive field');
    }
  };

  const fieldTypeLabels: Record<string, string> = {
    text: 'Text',
    textarea: 'Text Area',
    number: 'Number',
    email: 'Email',
    phone: 'Phone',
    select: 'Select',
    'multi-select': 'Multi Select',
    checkbox: 'Checkbox',
    radio: 'Radio',
    date: 'Date',
    datetime: 'Date & Time',
    time: 'Time',
    file: 'File',
    files: 'Files',
    'user-picker': 'User Picker',
    'department-picker': 'Department Picker',
    color: 'Color',
    rating: 'Rating',
    slider: 'Slider',
  };

  return (
    <div className="space-y-4 p-6">
      {/* Header with Add button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Custom Fields</h3>
          <p className="text-sm text-muted-foreground">
            {initialFields.length} field{initialFields.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Icons.Plus className="size-4 mr-2" />
          Add Field
        </Button>
      </div>

      {/* Table */}
      {initialFields.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Icons.FileQuestion className="size-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No custom fields yet</h3>
          <p className="text-muted-foreground mb-4">
            Add your first custom field to extend {entityType} forms
          </p>
          <Button onClick={handleAdd}>
            <Icons.Plus className="size-4 mr-2" />
            Add First Field
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Field Name</TableHead>
                <TableHead>Field Key</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Required</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialFields.map((field) => (
                <TableRow key={field.id}>
                  <TableCell className="font-medium">{field.order}</TableCell>
                  <TableCell>{field.label}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {field.fieldKey}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {fieldTypeLabels[field.fieldType] || field.fieldType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {field.section || '-'}
                  </TableCell>
                  <TableCell>
                    {field.required ? (
                      <Icons.CheckCircle2 className="size-4 text-green-600" />
                    ) : (
                      <Icons.Circle className="size-4 text-gray-300" />
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Icons.MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(field)}>
                          <Icons.Edit className="size-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(field.id, field.label)}
                          className="text-destructive"
                        >
                          <Icons.Trash className="size-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Dialog */}
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
    </div>
  );
}
