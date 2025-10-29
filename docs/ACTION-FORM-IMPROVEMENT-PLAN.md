# 🚀 **ACTION OLUŞTURMA SAYFASI İYİLEŞTİRME PLANI**

**Date:** 2025-01-29
**Status:** 📋 Planning Phase

---

## 📊 **MEVCUT DURUM ANALİZİ**

### **1. Code Structure**
```
✅ Page Route: /denetim/findings/[id]/actions/new/page.tsx
✅ Form Component: components/action/action-form.tsx
✅ Server Action: server/actions/action-actions.ts → createAction()
✅ Workflow Integration: Zaten mevcut (startWorkflow)
```

### **2. Mevcut Sorunlar**

#### **🔴 UI/UX Issues:**
```
❌ Manuel user ID girişi (assignedToId, managerId)
   → User-friendly değil, hata riski yüksek
   → Kullanıcı ID'lerini bilmek zorunda

❌ Basit input fields
   → Modern dropdown/select component yok
   → User'ları isme göre arayamıyor
   → Avatar/email bilgisi gösterilmiyor

❌ Form validation eksiklikleri
   → ID format validation yok
   → User existence check yok
```

#### **🔴 i18n Issues:**
```
❌ Tüm textler hardcoded English
   → "Action Details", "Assigned To", vs.
   
❌ Toast messages hardcoded
   → "Action created successfully"
   
❌ Error messages hardcoded
   → "Failed to create action"

❌ i18n altyapısı var ama kullanılmıyor
   → src/lib/i18n/* mevcut
   → Messages files yok
```

#### **✅ Workflow Engine:**
```
✅ Backend'de zaten entegre
   → getActionWorkflowId()
   → buildActionMetadata()
   → startWorkflow() çağrılıyor

✅ Action status workflow var
   → Assigned → PendingManagerApproval → Completed
   → Reject → Assigned (döngü)

⚠️ Frontend'de görünmüyor
   → User workflow statusunu görmüyor
   → Next step bilgisi yok
```

---

## 🎯 **İYİLEŞTİRME HEDEFLERİ**

### **1. User Selection (Priority: HIGH 🔥)**

#### **Target:**
```tsx
// ❌ Önce
<Input placeholder="User ID of the responsible person" />

// ✅ Sonra
<UserSelect 
  label="Aksiyon Sorumlusu"
  description="Aksiyonu tamamlayacak kişi"
  value={field.value}
  onChange={field.onChange}
  required
/>
```

#### **Features:**
- ✅ Searchable dropdown (name, email)
- ✅ Avatar gösterimi
- ✅ Department/Position info
- ✅ Loading states
- ✅ Empty states
- ✅ Keyboard navigation

---

### **2. i18n Integration (Priority: HIGH 🔥)**

#### **Target Structure:**
```
messages/
├── tr/
│   ├── action.json
│   ├── common.json
│   └── toast.json
└── en/
    ├── action.json
    ├── common.json
    └── toast.json
```

#### **action.json Keys:**
```json
{
  "action": {
    "newAction": "Yeni Aksiyon",
    "createActionFor": "Bulgu için aksiyon oluştur",
    "actionDetails": "Aksiyon Detayları",
    "detailsLabel": "Aksiyon Açıklaması",
    "detailsPlaceholder": "Düzeltici veya önleyici aksiyonu tanımlayın...",
    "detailsDescription": "Bulguyu gidermek için alınacak aksiyonu net bir şekilde açıklayın",
    "assignedToLabel": "Aksiyon Sorumlusu",
    "assignedToDescription": "Aksiyonu tamamlamaktan sorumlu kişi",
    "assignedToPlaceholder": "Sorumlu kişiyi seçin",
    "managerLabel": "Onaylayacak Yönetici",
    "managerDescription": "Aksiyonu onaylayacak yönetici (opsiyonel)",
    "managerPlaceholder": "Yönetici seçin",
    "createButton": "Aksiyon Oluştur",
    "cancelButton": "İptal",
    "validation": {
      "detailsRequired": "Aksiyon açıklaması gereklidir",
      "detailsMinLength": "En az 10 karakter girmelisiniz",
      "assignedToRequired": "Aksiyon sorumlusu seçmelisiniz"
    },
    "toast": {
      "createSuccess": "Aksiyon başarıyla oluşturuldu",
      "createError": "Aksiyon oluşturulamadı",
      "createErrorGeneric": "Bir hata oluştu"
    }
  }
}
```

---

### **3. Enhanced UI/UX (Priority: MEDIUM 📊)**

#### **Form Sections:**
```tsx
<Form>
  {/* 1. Finding Context */}
  <Card variant="outline">
    <CardHeader>
      <Badge>Bulgu</Badge>
      <p>{finding.details}</p>
    </CardHeader>
  </Card>

  {/* 2. Action Details */}
  <FormField name="details">
    <RichTextarea 
      minRows={5}
      maxLength={1000}
      showCounter
    />
  </FormField>

  {/* 3. Responsibility Assignment */}
  <div className="grid md:grid-cols-2 gap-4">
    <UserSelect name="assignedToId" />
    <UserSelect name="managerId" optional />
  </div>

  {/* 4. Workflow Info (Read-only) */}
  <Alert variant="info">
    <Info className="h-4 w-4" />
    <AlertDescription>
      Aksiyon oluşturulduktan sonra workflow başlayacak:
      Atandı → Tamamlandı → Yönetici Onayı → Tamamlandı
    </AlertDescription>
  </Alert>

  {/* 5. Actions */}
  <div className="flex gap-3 justify-end">
    <Button variant="outline">İptal</Button>
    <Button type="submit">
      <CheckCircle2 className="mr-2 h-4 w-4" />
      Aksiyon Oluştur
    </Button>
  </div>
</Form>
```

#### **Visual Improvements:**
- ✅ Better spacing and grouping
- ✅ Icons for visual hierarchy
- ✅ Info alerts for workflow explanation
- ✅ Character counter for textarea
- ✅ Loading skeleton states
- ✅ Success animation on submit

---

### **4. Workflow Visibility (Priority: LOW 📝)**

#### **Workflow Timeline Preview:**
```tsx
<WorkflowTimeline>
  <TimelineStep 
    status="current"
    title="Aksiyonunuz Atanacak"
    description="Sorumluya bildirim gidecek"
  />
  <TimelineStep 
    status="pending"
    title="Aksiyon Tamamlanacak"
    description="Sorumlu kişi tamamlayacak"
  />
  <TimelineStep 
    status="pending"
    title="Yönetici Onayı"
    description="Yönetici değerlendirecek"
  />
  <TimelineStep 
    status="pending"
    title="Tamamlandı"
    description="İş akışı sonlandı"
  />
</WorkflowTimeline>
```

---

## 📁 **IMPLEMENTATION PLAN**

### **PHASE 1: User Selection Component** ⏱️ 2-3 hours

#### **Step 1.1: Server Action for Users**
```typescript
// src/server/actions/user-actions.ts

export async function getActiveUsers(): Promise<ActionResponse<User[]>> {
  return withAuth(async (user: User) => {
    const users = await db.query.user.findMany({
      where: eq(user.status, 'active'),
      columns: {
        id: true,
        name: true,
        email: true,
      },
      with: {
        department: {
          columns: {
            id: true,
            name: true,
          },
        },
        position: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: (user, { asc }) => [asc(user.name)],
    });

    return {
      success: true,
      data: users,
    };
  });
}
```

#### **Step 1.2: UserSelect Component**
```typescript
// src/components/ui/user-select.tsx

"use client";

import { useState, useEffect } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, ChevronsUpDown, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserSelectProps {
  value?: string;
  onChange: (value: string) => void;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function UserSelect({ value, onChange, label, description, placeholder, required, disabled }: UserSelectProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch users from server action
    getActiveUsers().then(result => {
      if (result.success) {
        setUsers(result.data);
      }
      setLoading(false);
    });
  }, []);

  const selectedUser = users.find(u => u.id === value);

  return (
    <FormItem>
      <FormLabel>{label} {required && "*"}</FormLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled || loading}
          >
            {loading ? (
              "Loading..."
            ) : selectedUser ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {selectedUser.name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm">{selectedUser.name}</span>
                  <span className="text-xs text-muted-foreground">{selectedUser.email}</span>
                </div>
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder || "Select user..."}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput placeholder="Search users..." />
            <CommandEmpty>No user found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.id}
                  onSelect={() => {
                    onChange(user.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === user.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback className="text-xs">
                      {user.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                    {user.department && (
                      <span className="text-xs text-muted-foreground">
                        {user.department.name} • {user.position?.name}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
}
```

---

### **PHASE 2: i18n Integration** ⏱️ 1-2 hours

#### **Step 2.1: Create Message Files**
```bash
# Create directory structure
mkdir -p messages/tr messages/en

# Create action.json for both locales
touch messages/tr/action.json messages/en/action.json
```

#### **Step 2.2: Implement i18n Hook**
```typescript
// src/lib/i18n/use-action-translations.ts

import { useTranslations } from 'next-intl';

export function useActionTranslations() {
  const t = useTranslations('action');
  
  return {
    // Page
    newAction: t('newAction'),
    createActionFor: t('createActionFor'),
    actionDetails: t('actionDetails'),
    
    // Form
    detailsLabel: t('detailsLabel'),
    detailsPlaceholder: t('detailsPlaceholder'),
    detailsDescription: t('detailsDescription'),
    assignedToLabel: t('assignedToLabel'),
    assignedToDescription: t('assignedToDescription'),
    managerLabel: t('managerLabel'),
    managerDescription: t('managerDescription'),
    
    // Buttons
    createButton: t('createButton'),
    cancelButton: t('cancelButton'),
    
    // Validation
    validation: {
      detailsRequired: t('validation.detailsRequired'),
      detailsMinLength: t('validation.detailsMinLength'),
      assignedToRequired: t('validation.assignedToRequired'),
    },
    
    // Toast
    toast: {
      createSuccess: t('toast.createSuccess'),
      createError: t('toast.createError'),
      createErrorGeneric: t('toast.createErrorGeneric'),
    },
  };
}
```

#### **Step 2.3: Update Form Component**
```typescript
// components/action/action-form.tsx

"use client";

import { useActionTranslations } from '@/lib/i18n/use-action-translations';

export function ActionForm({ findingId }: ActionFormProps) {
  const t = useActionTranslations();
  
  // ... form setup
  
  return (
    <Form {...form}>
      <form>
        <FormField
          name="details"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.detailsLabel} *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t.detailsPlaceholder}
                  {...field}
                />
              </FormControl>
              <FormDescription>{t.detailsDescription}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* ... */}
        
        <Button type="submit">
          {t.createButton}
        </Button>
      </form>
    </Form>
  );
}
```

---

### **PHASE 3: Enhanced ActionForm** ⏱️ 2-3 hours

#### **Step 3.1: Integrate UserSelect**
```typescript
// Replace Input fields with UserSelect

<UserSelect
  value={field.value}
  onChange={field.onChange}
  label={t.assignedToLabel}
  description={t.assignedToDescription}
  placeholder={t.assignedToPlaceholder}
  required
/>

<UserSelect
  value={field.value}
  onChange={field.onChange}
  label={t.managerLabel}
  description={t.managerDescription}
  placeholder={t.managerPlaceholder}
/>
```

#### **Step 3.2: Add Finding Context Card**
```typescript
<Card variant="outline" className="mb-6">
  <CardHeader>
    <div className="flex items-center gap-2">
      <Badge variant="secondary">Bulgu</Badge>
      <Badge variant={riskBadgeVariant}>{finding.riskType}</Badge>
    </div>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-muted-foreground line-clamp-3">
      {finding.details}
    </p>
  </CardContent>
</Card>
```

#### **Step 3.3: Add Workflow Info Alert**
```typescript
<Alert variant="info" className="mb-6">
  <Info className="h-4 w-4" />
  <AlertTitle>Aksiyon İş Akışı</AlertTitle>
  <AlertDescription>
    Aksiyon oluşturulduktan sonra otomatik olarak iş akışı başlayacak.
    Sorumlu kişiye bildirim gönderilecek.
  </AlertDescription>
</Alert>
```

---

### **PHASE 4: Page Component Updates** ⏱️ 1 hour

#### **Step 4.1: Add i18n to Page**
```typescript
// app/(main)/denetim/findings/[id]/actions/new/page.tsx

import { getTranslations } from 'next-intl/server';

export default async function NewActionPage({ params }: PageProps) {
  const t = await getTranslations('action');
  
  return (
    <div>
      <h1>{t('newAction')}</h1>
      <p>{t('createActionFor')}</p>
      <ActionForm findingId={findingId} finding={findingData} />
    </div>
  );
}
```

#### **Step 4.2: Pass Finding Data to Form**
```typescript
// Form now receives full finding object
interface ActionFormProps {
  findingId: string;
  finding: Finding; // NEW
}
```

---

## ✅ **SUCCESS CRITERIA**

### **Functional:**
- [ ] User dropdown with search works
- [ ] Users fetched from server
- [ ] Avatar & info displayed correctly
- [ ] Form validation with proper messages
- [ ] i18n works (TR/EN switch)
- [ ] Action creation successful
- [ ] Workflow starts automatically
- [ ] Toast messages in correct language

### **UI/UX:**
- [ ] Professional, modern look
- [ ] Loading states visible
- [ ] Error states handled
- [ ] Responsive design (mobile-friendly)
- [ ] Keyboard navigation works
- [ ] Accessibility (ARIA labels)

### **Code Quality:**
- [ ] TypeScript type-safe
- [ ] DRY principles followed
- [ ] Reusable components
- [ ] Proper error handling
- [ ] Clean code structure

---

## 📊 **EFFORT ESTIMATION**

| Phase | Task | Time | Priority |
|-------|------|------|----------|
| 1 | User Selection Component | 2-3h | HIGH 🔥 |
| 2 | i18n Integration | 1-2h | HIGH 🔥 |
| 3 | Enhanced ActionForm | 2-3h | MEDIUM 📊 |
| 4 | Page Updates | 1h | LOW 📝 |
| - | Testing & Polish | 1-2h | - |
| **TOTAL** | | **7-11h** | |

---

## 🎯 **NEXT STEPS**

1. ✅ Review and approve this plan
2. 🔄 Start PHASE 1: User Selection Component
3. 🔄 Continue sequentially through phases
4. 🔄 Test each phase before moving forward
5. 🔄 Final integration testing

---

**STATUS:** 📋 **AWAITING APPROVAL**

Ready to start implementation! 🚀
