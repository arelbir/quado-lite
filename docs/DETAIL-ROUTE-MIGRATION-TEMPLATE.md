# 📋 DETAIL ROUTE MIGRATION TEMPLATE

## ✅ **Pattern: Client Component + searchParams + API Endpoint**

Bu template ile **tüm dynamic detail route'ları** aynı pattern'e migrate edilecek.

---

## 🎯 **3 ADIMLI MİGRASYON:**

### **ADIM 1: Client Component Detail Page**
### **ADIM 2: API Endpoint**
### **ADIM 3: Table Link Güncelle**

---

## 📝 **ADIM 1: CLIENT COMPONENT DETAIL PAGE**

**Dosya:** `src/app/(main)/[module]/[entity]-detail/page.tsx`

```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";

export default function [Entity]DetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      router.push('/[module]/[entity-list]');
      return;
    }

    // Fetch data from API
    fetch(`/api/[module]/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('[Entity] not found');
        return res.json();
      })
      .then(data => {
        setDetail(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex-1 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex-1 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">[Entity] Not Found</h1>
          <Button className="mt-4" asChild>
            <Link href="/[module]/[entity-list]">Back to List</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {detail.name}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/[module]/[entity-list]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/[module]/[entity-list]?edit=${id}`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Detail Cards */}
      <Card>
        <CardHeader>
          <CardTitle>[Entity] Information</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Entity specific fields */}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 📝 **ADIM 2: API ENDPOINT**

**Dosya:** `src/app/api/[module]/[id]/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { db } from "@/drizzle/db";
import { [entity] } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const detail = await db.query.[entity].findFirst({
      where: eq([entity].id, id),
      with: {
        // Relations
      },
    });

    if (!detail) {
      return NextResponse.json(
        { error: '[Entity] not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(detail);
  } catch (error) {
    console.error("❌ [API] Error:", error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 📝 **ADIM 3: TABLE LINK GÜNCELLE**

**Dosya:** `src/app/(main)/[module]/[entity-list]/columns.tsx`

```typescript
// BEFORE
<Link href={`/[module]/[entity]/${row.id}`}>
  View Details
</Link>

// AFTER
<Link href={`/[module]/[entity]-detail?id=${row.id}`}>
  View Details
</Link>
```

---

## 📋 **MİGRASYON LİSTESİ:**

### **Admin Module:**
- [ ] Companies → `/admin/organization/companies/company-detail?id=xxx`
- [ ] Branches → `/admin/organization/branches/branch-detail?id=xxx`
- [ ] Departments → `/admin/organization/departments/department-detail?id=xxx`
- [ ] Positions → `/admin/organization/positions/position-detail?id=xxx`
- [ ] Roles → `/admin/roles/role-detail?id=xxx`

### **Denetim Module:**
- [ ] Audits → `/denetim/audits/audit-detail?id=xxx`
- [ ] Findings → `/denetim/findings/finding-detail?id=xxx`
- [ ] Actions → `/denetim/actions/action-detail?id=xxx`
- [ ] DOFs → `/denetim/dofs/dof-detail?id=xxx`

---

## ✅ **CHECKLIST HER ENTITY İÇİN:**

1. [ ] Client component detail page oluşturuldu
2. [ ] API endpoint oluşturuldu
3. [ ] Table link güncellendi
4. [ ] Auth callback bypass eklendi (eğer gerekiyorsa)
5. [ ] Test edildi (list → detail → works)

---

## 🔧 **AUTH CALLBACK GÜNCELLEMESİ:**

**Eğer yeni entity ekliyorsan:**

```typescript
// src/config/auth.ts
if (pathname.includes('/user-detail') || 
    pathname.includes('/company-detail') ||  // YENİ!
    pathname.includes('/detail?id=')) {
  return true;
}
```

---

## 📊 **ÖRNEK: COMPANIES**

**Detail Page:** `src/app/(main)/admin/organization/companies/company-detail/page.tsx`  
**API:** `src/app/api/companies/[id]/route.ts`  
**Link:** `columns.tsx` → `/admin/organization/companies/company-detail?id=xxx`

---

**🚀 Bu template ile tüm detail route'ları 15-20 dakikada migrate edilebilir!**
