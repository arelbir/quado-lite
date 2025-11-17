'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { CustomFieldWithValue } from '@/types/domain';
import { Icons } from '@/components/shared/icons';

interface CustomFieldsDisplayProps {
  fields: CustomFieldWithValue[];
}

/**
 * CustomFieldsDisplay - Display custom field values in a read-only format
 * Used in detail pages to show custom field data
 */
export function CustomFieldsDisplay({ fields }: CustomFieldsDisplayProps) {
  if (fields.length === 0) return null;

  const formatValue = (field: CustomFieldWithValue) => {
    const { definition, value } = field;
    
    if (!value && value !== 0 && value !== false) return '-';

    switch (definition.fieldType) {
      case 'date':
        return new Date(value).toLocaleDateString('tr-TR');
      
      case 'datetime':
        return new Date(value).toLocaleString('tr-TR');
      
      case 'time':
        return value;
      
      case 'checkbox':
        return value ? (
          <Badge variant="default" className="bg-green-500">
            <Icons.CheckCircle2 className="size-3 mr-1" />
            Yes
          </Badge>
        ) : (
          <Badge variant="secondary">
            <Icons.X className="size-3 mr-1" />
            No
          </Badge>
        );
      
      case 'select':
      case 'radio':
        const option = definition.options?.find(o => o.value === value);
        return option ? (
          <Badge variant="secondary">{option.label}</Badge>
        ) : value;
      
      case 'number':
        return typeof value === 'number' ? value.toLocaleString('tr-TR') : value;
      
      case 'file':
      case 'files':
        return Array.isArray(value) 
          ? `${value.length} file(s)` 
          : '1 file';
      
      default:
        return String(value);
    }
  };

  // Group by section
  const sections = fields.reduce((acc, field) => {
    const section = field.definition.section || 'Additional Information';
    if (!acc[section]) acc[section] = [];
    acc[section].push(field);
    return acc;
  }, {} as Record<string, CustomFieldWithValue[]>);

  return (
    <div className="space-y-4">
      {Object.entries(sections).map(([sectionName, sectionFields]) => (
        <Card key={sectionName}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Icons.FileText className="size-5" />
              {sectionName}
            </CardTitle>
            <Separator className="mt-2" />
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sectionFields.map((field) => (
                <div key={field.definition.id} className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">
                    {field.definition.label}
                    {field.definition.required && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </dt>
                  <dd className="text-sm">
                    {formatValue(field)}
                  </dd>
                  {field.definition.helpText && (
                    <p className="text-xs text-muted-foreground">
                      {field.definition.helpText}
                    </p>
                  )}
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
