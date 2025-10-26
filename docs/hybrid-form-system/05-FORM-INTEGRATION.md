# 📝 STEP 5: FORM INTEGRATION

**Phase:** Implementation  
**Duration:** 3-4 days  
**Dependencies:** Admin UI (Step 4)

---

## **🎯 OBJECTIVES:**

- Integrate HybridForm with existing forms
- Update form submission logic
- Test with all entity types
- Ensure backward compatibility

---

## **1️⃣ AUDIT FORM INTEGRATION:**

```typescript
// src/app/(main)/denetim/audits/create/page.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { auditSchema } from '@/lib/schemas/audit';
import { HybridForm } from '@/components/forms/HybridForm';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { UserPicker } from '@/components/ui/user-picker';
import { Button } from '@/components/ui/button';
import { createAudit } from '@/server/actions/audit-actions';
import { saveCustomFieldValues } from '@/server/actions/custom-field-value-actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CreateAuditPage() {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(auditSchema),
    defaultValues: {
      title: '',
      auditType: '',
      riskLevel: '',
      processOwnerId: '',
      // ... more core fields
    },
  });

  async function onSubmit(data: { core: any; custom: any }) {
    try {
      // 1. Create audit (core fields)
      const auditResult = await createAudit(data.core);
      
      if (!auditResult.success) {
        toast.error(auditResult.error || 'Failed to create audit');
        return;
      }

      // 2. Save custom fields
      if (Object.keys(data.custom).length > 0) {
        await saveCustomFieldValues({
          entityType: 'AUDIT',
          entityId: auditResult.data!.id,
          values: data.custom,
        });
      }

      toast.success('Audit created successfully');
      router.push(`/denetim/audits/${auditResult.data!.id}`);
    } catch (error) {
      console.error('Error creating audit:', error);
      toast.error('An error occurred');
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Create Audit</h1>

      <HybridForm
        entityType="AUDIT"
        onSubmit={onSubmit}
        coreFields={
          <Form {...form}>
            {/* Core fields (type-safe) */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter audit title" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="riskLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Risk Level *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="processOwnerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Process Owner *</FormLabel>
                  <UserPicker
                    value={field.value}
                    onChange={field.onChange}
                    filter={{ role: 'PROCESS_OWNER' }}
                  />
                </FormItem>
              )}
            />

            {/* ... more core fields ... */}
          </Form>
        }
      >
        {/* Submit button */}
        <div className="flex justify-end gap-2 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit((coreData) => {
              // This will be called by HybridForm with both core and custom data
              form.handleSubmit((core) => onSubmit({ core, custom: {} }))();
            })}
          >
            Create Audit
          </Button>
        </div>
      </HybridForm>
    </div>
  );
}
```

---

## **2️⃣ EDIT MODE (With Existing Values):**

```typescript
// src/app/(main)/denetim/audits/[id]/edit/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { getAuditById } from '@/server/actions/audit-actions';
import { HybridForm } from '@/components/forms/HybridForm';
// ... other imports

export default function EditAuditPage({ params }: { params: { id: string } }) {
  const [audit, setAudit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAudit() {
      const result = await getAuditById(params.id);
      if (result.success && result.data) {
        setAudit(result.data);
      }
      setIsLoading(false);
    }
    loadAudit();
  }, [params.id]);

  if (isLoading) return <div>Loading...</div>;
  if (!audit) return <div>Audit not found</div>;

  return (
    <HybridForm
      entityType="AUDIT"
      entityId={params.id} // Pass entityId for edit mode
      onSubmit={async (data) => {
        // Update audit
        await updateAudit(params.id, data.core);
        
        // Update custom fields
        await saveCustomFieldValues({
          entityType: 'AUDIT',
          entityId: params.id,
          values: data.custom,
        });
      }}
      coreFields={
        <Form {...form}>
          {/* Pre-populated core fields */}
        </Form>
      }
    />
  );
}
```

---

## **3️⃣ DETAIL PAGE (Display Custom Fields):**

```typescript
// src/app/(main)/denetim/audits/[id]/page.tsx

import { getCustomFieldValuesWithDefinitions } from '@/server/actions/custom-field-value-actions';
import { CustomFieldsDisplay } from '@/components/forms/CustomFieldsDisplay';

export default async function AuditDetailPage({ params }: { params: { id: string } }) {
  // Load audit
  const audit = await getAuditById(params.id);
  
  // Load custom fields
  const customFieldsResult = await getCustomFieldValuesWithDefinitions('AUDIT', params.id);
  const customFields = customFieldsResult.success && customFieldsResult.data 
    ? customFieldsResult.data 
    : [];

  return (
    <div className="container mx-auto py-6">
      {/* Core audit data */}
      <div className="space-y-4">
        <h1>{audit.title}</h1>
        <div>Risk Level: {audit.riskLevel}</div>
        {/* ... more core fields ... */}
      </div>

      {/* Custom fields */}
      {customFields.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
          <CustomFieldsDisplay fields={customFields} />
        </div>
      )}
    </div>
  );
}
```

---

## **4️⃣ CUSTOM FIELDS DISPLAY COMPONENT:**

```typescript
// src/components/forms/CustomFieldsDisplay.tsx

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CustomFieldDefinition } from '@/lib/types';

interface CustomFieldsDisplayProps {
  fields: Array<{
    definition: CustomFieldDefinition;
    value: any;
  }>;
}

export function CustomFieldsDisplay({ fields }: CustomFieldsDisplayProps) {
  const formatValue = (field: CustomFieldDefinition, value: any) => {
    if (!value) return '-';

    switch (field.fieldType) {
      case 'date':
      case 'datetime':
        return new Date(value).toLocaleDateString();
      
      case 'checkbox':
        return value ? '✓ Yes' : '✗ No';
      
      case 'select':
        const option = field.options?.find(o => o.value === value);
        return option?.label || value;
      
      case 'user-picker':
        return value.name || value.id;
      
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
  const sections = fields.reduce((acc, item) => {
    const section = item.definition.section || 'Additional Information';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, typeof fields>);

  return (
    <div className="space-y-4">
      {Object.entries(sections).map(([sectionName, sectionFields]) => (
        <Card key={sectionName}>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">{sectionName}</h3>
            <dl className="grid grid-cols-2 gap-4">
              {sectionFields.map(({ definition, value }) => (
                <div key={definition.id}>
                  <dt className="text-sm font-medium text-muted-foreground">
                    {definition.label}
                  </dt>
                  <dd className="mt-1 text-sm">
                    {formatValue(definition, value)}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

## **5️⃣ APPLY TO ALL ENTITIES:**

### **Finding Form:**
```typescript
// src/app/(main)/denetim/findings/create/page.tsx

<HybridForm
  entityType="FINDING"
  onSubmit={handleSubmit}
  coreFields={<FindingCoreFields />}
/>
```

### **Action Form:**
```typescript
// src/app/(main)/denetim/actions/create/page.tsx

<HybridForm
  entityType="ACTION"
  onSubmit={handleSubmit}
  coreFields={<ActionCoreFields />}
/>
```

### **DOF Form:**
```typescript
// src/app/(main)/denetim/dofs/create/page.tsx

<HybridForm
  entityType="DOF"
  onSubmit={handleSubmit}
  coreFields={<DOFCoreFields />}
/>
```

---

## **✅ CHECKLIST:**

- [ ] Integrate Audit form (create & edit)
- [ ] Integrate Finding form
- [ ] Integrate Action form
- [ ] Integrate DOF form
- [ ] Add CustomFieldsDisplay component
- [ ] Test create flow
- [ ] Test edit flow
- [ ] Test display flow
- [ ] Verify validation works
- [ ] Test with various field types

---

**Status:** ✅ Forms integrated  
**Next:** [Workflow Integration](./06-WORKFLOW-INTEGRATION.md)
