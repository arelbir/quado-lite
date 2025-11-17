import { getCustomFieldDefinitions } from '@/features/custom-fields/actions/definition-actions';
import { CustomFieldsTable } from './CustomFieldsTable';
import { Card } from '@/components/ui/card';

interface PageProps {
  params: {
    entityType: string;
  };
}

export default async function CustomFieldsPage({ params }: PageProps) {
  const entityType = params.entityType.toUpperCase();
  
  const result = await getCustomFieldDefinitions(entityType);
  const fields = result.success && result.data ? result.data : [];

  // Format entity type for display
  const entityLabel = entityType
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Custom Fields - {entityLabel}
        </h1>
        <p className="text-muted-foreground mt-1">
          Add additional fields to {entityLabel.toLowerCase()} forms
        </p>
      </div>

      {/* Table */}
      <Card>
        <CustomFieldsTable
          entityType={entityType}
          initialFields={fields}
        />
      </Card>
    </div>
  );
}
