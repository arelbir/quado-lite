# 📊 REPORTING SYSTEM - MASTER PLAN

**Tarih:** 2025-10-23  
**Kapsam:** Excel + PDF Raporlama Sistemi

---

## **🎯 HEDEF**

Profesyonel raporlama sistemi:
- ✅ Excel Export (Mevcut - geliştirilecek)
- ⭐ PDF Export (Yeni)
- 📋 Detaylı Raporlar (Denetim, Aksiyon, DÖF)
- 🎨 Şablonlar & Formatlar
- 🔄 Ortak Infrastructure

---

## **📦 MEVCUT DURUM**

### **✅ Var Olan:**
```
src/lib/export/
  ├── excel-export-service.ts ✅ (ExcelJS)
  
src/action/
  ├── export-actions.ts ✅ (Temel fonksiyonlar)
  
Fonksiyonlar:
  ✅ exportFindingsToExcel()
  ✅ exportActionsToExcel()
  🚧 exportAuditReport() - Placeholder
```

### **❌ Eksik:**
- PDF export servisi
- Detaylı rapor şablonları
- DÖF raporu
- Chart/grafik desteği
- Logo & branding

---

## **🏗️ YENİ MİMARİ**

### **Klasör Yapısı:**
```
src/lib/reporting/
├── core/
│   ├── excel-generator.ts     (ExcelJS wrapper)
│   ├── pdf-generator.ts       (jsPDF wrapper) ⭐ YENİ
│   └── report-types.ts        (Common types)
│
├── templates/
│   ├── audit-report.ts        ⭐ YENİ
│   ├── action-report.ts       ⭐ YENİ
│   ├── dof-report.ts          ⭐ YENİ
│   └── finding-report.ts      (Refactor mevcut)
│
├── formatters/
│   ├── date-formatter.ts
│   ├── status-formatter.ts
│   └── currency-formatter.ts
│
└── utils/
    ├── chart-generator.ts     (Optional)
    ├── logo-handler.ts
    └── style-constants.ts

src/action/
└── report-actions.ts          ⭐ YENİ (Tüm report actions)
```

---

## **📋 RAPOR TÜRLERİ**

### **1. DENETİM RAPORU (Audit Report)**

**İçerik:**
```
Sheet 1: Özet
  - Denetim bilgileri
  - Denetçi bilgileri
  - Tarih/Süre
  - Genel istatistikler

Sheet 2: Bulgular
  - Tüm bulgular listesi
  - Risk seviyeleri
  - Sorumlu atamaları
  - Durumlar

Sheet 3: Aksiyonlar
  - Bulguya bağlı aksiyonlar
  - Sorumlular
  - Tamamlanma oranları

Sheet 4: DÖF'ler
  - CAPA listesi
  - 8-adım durumları
  - Faaliyet sayıları

Sheet 5: İstatistikler
  - Risk dağılımı
  - Durum grafikleri
  - Tamamlanma oranları
```

**Formatlar:**
- ✅ Excel (Multi-sheet)
- ⭐ PDF (Professional layout)

---

### **2. AKSİYON RAPORU (Action Report)**

**İçerik:**
```
Sheet 1: Aksiyon Listesi
  - Aksiyon detayları
  - Sorumlu/Yönetici
  - Durumlar
  - Tamamlanma tarihleri
  - İlgili bulgular

Sheet 2: Timeline
  - Progress events
  - Onay/Red geçmişi
  - Tamamlanma süreci

Sheet 3: İstatistikler
  - Durum dağılımı
  - Sorumlu bazlı gruplandırma
  - Ortalama tamamlanma süresi
```

**Formatlar:**
- ✅ Excel
- ⭐ PDF

---

### **3. DÖF RAPORU (CAPA Report)**

**İçerik:**
```
Sheet 1: DÖF Özet
  - Problem tanımı (5N1K)
  - Geçici önlemler
  - Kök neden analizi
  - Faaliyet sayıları
  - Etkinlik kontrolü

Sheet 2: Kök Neden Analizi
  - 5 Why analizi
  - Fishbone diagram bilgisi
  - Freeform açıklamalar

Sheet 3: Faaliyetler
  - Düzeltici faaliyetler
  - Önleyici faaliyetler
  - Sorumlular
  - Tamamlanma durumları

Sheet 4: Timeline
  - 8-adım progress
  - Onay süreçleri
  - Tamamlanma geçmişi
```

**Formatlar:**
- ✅ Excel (Multi-sheet)
- ⭐ PDF (CAPA format)

---

## **🔧 TEKNIK STACK**

### **Excel Export:**
```json
{
  "library": "exceljs",
  "features": [
    "Multi-sheet support ✅",
    "Styling & formatting ✅",
    "Auto-filter ✅",
    "Charts (optional)",
    "Conditional formatting"
  ]
}
```

### **PDF Export:**
```json
{
  "library": "jsPDF + jsPDF-AutoTable",
  "alternatives": [
    "@react-pdf/renderer (React components)",
    "pdfmake (declarative)"
  ],
  "features": [
    "Headers/footers",
    "Tables",
    "Images/logos",
    "Multi-page",
    "Turkish character support"
  ]
}
```

---

## **📐 ORTAK YAPILAR**

### **Report Types:**
```typescript
// src/lib/reporting/core/report-types.ts

export interface ReportMetadata {
  title: string;
  generatedAt: Date;
  generatedBy: string;
  reportType: 'audit' | 'action' | 'dof' | 'finding';
  format: 'excel' | 'pdf';
}

export interface ReportSection {
  title: string;
  data: any[];
  columns: ColumnDefinition[];
  summary?: Record<string, any>;
}

export interface ReportOptions {
  metadata: ReportMetadata;
  sections: ReportSection[];
  includeLogo?: boolean;
  includeCharts?: boolean;
  includeTimeline?: boolean;
}
```

### **Formatters:**
```typescript
// Status formatter
export function formatStatus(status: string, type: 'audit' | 'finding' | 'action' | 'dof'): string

// Date formatter
export function formatDate(date: Date, format: 'short' | 'long' | 'datetime'): string

// Number formatter
export function formatNumber(value: number, type: 'percentage' | 'count'): string
```

---

## **🎨 TEMPLATE PATTERN**

### **Örnek: Audit Report Template:**
```typescript
// src/lib/reporting/templates/audit-report.ts

export interface AuditReportData {
  audit: Audit;
  findings: Finding[];
  actions: Action[];
  dofs: DOF[];
  statistics: AuditStatistics;
}

export async function generateAuditReport(
  data: AuditReportData,
  format: 'excel' | 'pdf'
): Promise<Buffer> {
  
  const reportSections: ReportSection[] = [
    buildSummarySection(data),
    buildFindingsSection(data.findings),
    buildActionsSection(data.actions),
    buildDofsSection(data.dofs),
    buildStatisticsSection(data.statistics),
  ];

  const metadata: ReportMetadata = {
    title: `Denetim Raporu - ${data.audit.title}`,
    generatedAt: new Date(),
    generatedBy: await currentUser(),
    reportType: 'audit',
    format,
  };

  if (format === 'excel') {
    return generateExcelReport({ metadata, sections: reportSections });
  } else {
    return generatePdfReport({ metadata, sections: reportSections });
  }
}
```

---

## **📦 IMPLEMENTATION PLAN**

### **Phase 1: Core Infrastructure (Week 1)**
```
✅ Excel generator wrapper (refactor mevcut)
⭐ PDF generator (yeni)
⭐ Report types & interfaces
⭐ Formatters
⭐ Style constants
```

### **Phase 2: Excel Templates (Week 2)**
```
⭐ Audit report template (multi-sheet)
⭐ Action report template
⭐ DOF report template
✅ Finding report template (refactor mevcut)
```

### **Phase 3: PDF Templates (Week 3)**
```
⭐ PDF layout system
⭐ Audit PDF template
⭐ Action PDF template
⭐ DOF PDF template
```

### **Phase 4: Server Actions (Week 4)**
```
⭐ report-actions.ts (tüm report endpoints)
⭐ Permission checks
⭐ Caching strategy
⭐ Error handling
```

### **Phase 5: UI Integration (Week 5)**
```
⭐ Report download buttons
⭐ Format selector (Excel/PDF)
⭐ Loading states
⭐ Preview modal (optional)
```

### **Phase 6: Advanced Features (Week 6)**
```
⭐ Charts & graphs
⭐ Logo & branding
⭐ Email delivery
⭐ Scheduled reports (optional)
```

---

## **🚀 QUICK START - İLK ADIM**

### **1. Dependencies Ekle:**
```bash
npm install jspdf jspdf-autotable
npm install @types/jspdf --save-dev
```

### **2. PDF Generator Oluştur:**
```typescript
// src/lib/reporting/core/pdf-generator.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function generatePdfReport(options: ReportOptions): Promise<Buffer>
```

### **3. İlk Template: Audit Report:**
```typescript
// src/lib/reporting/templates/audit-report.ts
export async function generateAuditReportExcel(auditId: string): Promise<Buffer>
export async function generateAuditReportPdf(auditId: string): Promise<Buffer>
```

### **4. Server Actions:**
```typescript
// src/action/report-actions.ts
export async function downloadAuditReport(auditId: string, format: 'excel' | 'pdf')
export async function downloadActionReport(actionId: string, format: 'excel' | 'pdf')
export async function downloadDofReport(dofId: string, format: 'excel' | 'pdf')
```

---

## **💡 BEST PRACTICES**

### **1. Performance:**
- Büyük raporlar için pagination
- Lazy loading data
- Server-side generation (CPU-intensive)
- Caching compiled reports

### **2. Security:**
- Permission checks (withAuth)
- Data filtering (sadece yetkili veriler)
- XSS sanitization

### **3. Maintainability:**
- Template pattern (DRY)
- Shared formatters
- Type-safe interfaces
- Documented functions

---

## **📊 ÖRNEK KULLANIM**

### **UI Component:**
```tsx
// components/audit/audit-report-button.tsx
"use client";

export function AuditReportButton({ auditId }: { auditId: string }) {
  const [format, setFormat] = useState<'excel' | 'pdf'>('excel');
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    const buffer = await downloadAuditReport(auditId, format);
    
    // Download file
    const blob = new Blob([buffer], { 
      type: format === 'excel' 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-report-${auditId}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
    link.click();
    
    setLoading(false);
  };

  return (
    <div className="flex gap-2">
      <Select value={format} onValueChange={(v) => setFormat(v as any)}>
        <SelectItem value="excel">Excel</SelectItem>
        <SelectItem value="pdf">PDF</SelectItem>
      </Select>
      <Button onClick={handleDownload} disabled={loading}>
        {loading ? 'Generating...' : 'Download Report'}
      </Button>
    </div>
  );
}
```

---

## **🎯 ÖZET**

### **Yapılacaklar:**
1. ⭐ PDF generator ekle (jsPDF)
2. ⭐ Template system kur
3. ⭐ 3 detaylı rapor template (Audit, Action, DOF)
4. ⭐ Report actions oluştur
5. ⭐ UI components ekle
6. ⭐ Charts (optional)

### **Avantajlar:**
- ✅ Professional reports
- ✅ Multi-format (Excel/PDF)
- ✅ Reusable templates
- ✅ Type-safe
- ✅ Maintainable

### **Timeline:**
- **Core:** 1 hafta
- **Templates:** 2 hafta
- **UI:** 1 hafta
- **Total:** ~4 hafta (optimistic)

---

**READY TO IMPLEMENT! 🚀**

Önce PDF generator'ı mı ekleyeyim? Yoksa bir template ile başlayalım mı?
