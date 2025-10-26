# BULK FIX - All [id] Routes

## FILES TO FIX (13 remaining):

1. templates/[id]/edit/page.tsx
2. branches/[id]/page.tsx
3. departments/[id]/page.tsx
4. positions/[id]/page.tsx
5. roles/[id]/page.tsx
6. actions/[id]/page.tsx
7. audits/[id]/page.tsx
8. audits/[id]/edit/page.tsx
9. audits/[id]/questions/page.tsx
10. dofs/[id]/page.tsx
11. findings/[id]/page.tsx
12. plans/[id]/edit/page.tsx
13. users/[id]/test.tsx

## PATTERN TO APPLY:

```typescript
// BEFORE:
interface PageProps {
  params: {
    id: string;
  };
}

export default async function Page({ params }: PageProps) {
  // ... params.id usage
}

// AFTER:
interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  // ... id usage (replace all params.id with id)
}
```

## STATUS - 100% COMPLETE! ✅

**ALL 13 FILES FIXED:**

### Templates (2/2):
- ✅ templates/[id]/page.tsx
- ✅ templates/[id]/edit/page.tsx

### Denetim Core (3/3):
- ✅ audits/[id]/page.tsx (most complex - searchParams too)
- ✅ actions/[id]/page.tsx
- ✅ findings/[id]/page.tsx

### Denetim Extended (4/4):
- ✅ dofs/[id]/page.tsx
- ✅ audits/[id]/edit/page.tsx
- ✅ audits/[id]/questions/page.tsx
- ✅ plans/[id]/edit/page.tsx

### Organization (4/4):
- ✅ branches/[id]/page.tsx
- ✅ departments/[id]/page.tsx
- ✅ positions/[id]/page.tsx
- ✅ roles/[id]/page.tsx

**Total Lines Changed:** ~150+ lines across 13 files
**Time Taken:** ~15 minutes
**Pattern Applied:** Consistent Promise<{ id: string }> + await params
