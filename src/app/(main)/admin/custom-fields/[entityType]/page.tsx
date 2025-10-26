import { getCustomFieldDefinitions } from '@/server/actions/custom-field-definition-actions';
import { CustomFieldsTable } from './CustomFieldsTable';
import { Card } from '@/components/ui/card';

interface PageProps {
  params: {
    entityType: string;
  };
}

export default async function CustomFieldsPage({ params }: PageProps) {
  const entityType = params.entityType.toUpperCase() as 'AUDIT' | 'FINDING' | 'ACTION' | 'DOF';
  
  const result = await getCustomFieldDefinitions(entityType);
  const fields = result.success && result.data ? result.data : [];

  const entityLabels = {
    AUDIT: 'Audit',
    FINDING: 'Finding',
    ACTION: 'Action',
    DOF: 'DOF'
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Custom Fields - {entityLabels[entityType]}
        </h1>
        <p className="text-muted-foreground mt-1">
          Add additional fields to {entityLabels[entityType].toLowerCase()} forms
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
