'use client';

import { DynamicFieldRenderer } from './DynamicFieldRenderer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { CustomFieldDefinition } from '@/lib/types';

interface CustomFieldsSectionProps {
  fields: CustomFieldDefinition[];
  values: Record<string, any>;
  onChange: (fieldKey: string, value: any) => void;
  disabled?: boolean;
}

/**
 * CustomFieldsSection - Renders dynamic custom fields grouped by section
 */
export function CustomFieldsSection({
  fields,
  values,
  onChange,
  disabled,
}: CustomFieldsSectionProps) {
  // Group fields by section
  const sections = fields.reduce((acc, field) => {
    const section = field.section || 'Additional Information';
    if (!acc[section]) acc[section] = [];
    acc[section].push(field);
    return acc;
  }, {} as Record<string, CustomFieldDefinition[]>);

  return (
    <div className="space-y-6">
      {Object.entries(sections).map(([sectionName, sectionFields]) => (
        <Card key={sectionName}>
          <CardHeader>
            <CardTitle className="text-lg">{sectionName}</CardTitle>
            <Separator className="mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            {sectionFields.map(field => (
              <DynamicFieldRenderer
                key={field.id}
                field={field}
                value={values[field.fieldKey]}
                onChange={(value) => onChange(field.fieldKey, value)}
                disabled={disabled}
              />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
