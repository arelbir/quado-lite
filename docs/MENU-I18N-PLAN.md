# 🌍 MENÜ YAPISI i18n PLANLAMA

## **📊 MEVCUT DURUM ANALİZİ**

### **Database Schema:**
```sql
Table: Menu
- id: uuid (PK)
- label: varchar ← HARD-CODED (örn: "Dashboard", "Denetim Sistemi")
- path: varchar
- icon: varchar
- parentId: uuid (self-reference)
- status: enum
- type: enum
```

### **Sidebar Component Flow:**
```
1. getUserPermissions(userId) → Database'den menu
2. buildMenu(permissions.menus) → MenuItem[] oluştur
3. SidebarContainer → Render
```

### **Sorun:**
- ❌ `menu.label` doğrudan database'den geliyor
- ❌ Hard-coded Türkçe/İngilizce karışık
- ❌ Dil değiştiğinde menü güncellenmiyor

---

## **🎯 ÇÖZÜM STRATEJİLERİ**

### **STRATEJİ 1: Translation Key Yaklaşımı (ÖNERİLEN ✅)**

**Mantık:**
- Database'de `label` → Translation KEY olarak kullan
- "Dashboard" → `navigation.dashboard`
- "Denetim Sistemi" → `navigation.auditSystem`

**Avantajlar:**
- ✅ Database değişikliği gerektirmez
- ✅ Mevcut label'lar key'e dönüştürülür
- ✅ Basit implementasyon
- ✅ Geriye dönük uyumlu

**Dezavantajlar:**
- ⚠️ Database'deki mevcut label'ları güncellemek gerekir
- ⚠️ Admin panel'den menu eklerken key girmek gerekir

---

### **STRATEJİ 2: labelKey Field Ekleme (GELİŞMİŞ)**

**Mantık:**
- Database'e `labelKey` field'ı ekle
- `labelKey` varsa → Translation kullan
- `labelKey` yoksa → `label` kullan (fallback)

**Avantajlar:**
- ✅ Geriye dönük tam uyumlu
- ✅ Kademeli geçiş mümkün
- ✅ Admin panel'de hem key hem label

**Dezavantajlar:**
- ⚠️ Migration gerekir
- ⚠️ Database değişikliği

---

## **💡 ÖNERİLEN YAKLAŞIM: Strateji 1**

### **NEDEN?**
1. Basit ve hızlı
2. Database migration gerektirmez
3. Mevcut label'lar key olarak kullanılabilir
4. Production'da minimal risk

---

## **🔧 IMPLEMENTATION PLANI**

### **ADIM 1: Navigation Translation Dosyaları ✅ (Zaten Var)**

```json
// tr/navigation.json
{
  "dashboard": "Kontrol Paneli",
  "auditSystem": "Denetim Sistemi",
  "audits": "Denetimler",
  "plans": "Planlar",
  "actions": "Aksiyonlar",
  "findings": "Bulgular",
  "dofs": "DÖF'ler",
  "templates": "Şablonlar",
  "questionBanks": "Soru Havuzları",
  "myTasks": "Görevlerim",
  "reports": "Raporlar",
  "settings": "Ayarlar",
  "system": {
    "title": "Sistem",
    "users": "Kullanıcılar",
    "menus": "Menüler",
    "roles": "Roller"
  }
}
```

```json
// en/navigation.json
{
  "dashboard": "Dashboard",
  "auditSystem": "Audit System",
  "audits": "Audits",
  "plans": "Plans",
  "actions": "Actions",
  "findings": "Findings",
  "dofs": "CAPAs",
  "templates": "Templates",
  "questionBanks": "Question Banks",
  "myTasks": "My Tasks",
  "reports": "Reports",
  "settings": "Settings",
  "system": {
    "title": "System",
    "users": "Users",
    "menus": "Menus",
    "roles": "Roles"
  }
}
```

---

### **ADIM 2: Sidebar Component Güncelleme**

**Değişiklik:**
```tsx
// ÖNCE (Mevcut)
function buildMenu(menus: MenuWithChildren[]): MenuItem[] {
  return menus.map(menu => {
    const Icon = Icons[menu.icon as keyof typeof Icons] || Icons.Package
    return {
      path: menu.path,
      label: menu.label, // ← Hard-coded
      icon: <Icon className='size-4' />,
      children: buildMenu(menu.children)
    }
  })
}

// SONRA (i18n)
function buildMenu(menus: MenuWithChildren[], t: any): MenuItem[] {
  return menus.map(menu => {
    const Icon = Icons[menu.icon as keyof typeof Icons] || Icons.Package
    
    // Label'ı translation key olarak kullan
    const translatedLabel = t(menu.label) || menu.label; // Fallback
    
    return {
      path: menu.path,
      label: translatedLabel, // ← Translated
      icon: <Icon className='size-4' />,
      children: buildMenu(menu.children, t)
    }
  })
}

export const Sidebar = async ({ userId }: { userId?: string }) => {
  const permissions = await getUserPermissions({ userId });
  if (!permissions) return null;

  // i18n eklendi
  const t = await getTranslations('navigation');
  const routes = buildMenu(permissions.menus, t);
  
  return <SidebarContainer routes={routes} />;
};
```

---

### **ADIM 3: Database Menu Label'larını Güncelleme**

**Migration SQL:**
```sql
-- Mevcut label'ları translation key'e dönüştür
UPDATE "Menu" SET label = 'dashboard' WHERE label = 'Dashboard';
UPDATE "Menu" SET label = 'auditSystem' WHERE label = 'Denetim Sistemi';
UPDATE "Menu" SET label = 'audits' WHERE label = 'Denetimler';
UPDATE "Menu" SET label = 'plans' WHERE label = 'Planlar';
UPDATE "Menu" SET label = 'actions' WHERE label = 'Aksiyonlar';
UPDATE "Menu" SET label = 'findings' WHERE label = 'Bulgular';
UPDATE "Menu" SET label = 'dofs' WHERE label = 'DÖF\'ler';
UPDATE "Menu" SET label = 'templates' WHERE label = 'Şablonlar';
UPDATE "Menu" SET label = 'questionBanks' WHERE label = 'Soru Havuzları';
UPDATE "Menu" SET label = 'myTasks' WHERE label = 'Görevlerim';
UPDATE "Menu" SET label = 'reports' WHERE label = 'Raporlar';
UPDATE "Menu" SET label = 'settings' WHERE label = 'Ayarlar';

-- Nested menu'ler
UPDATE "Menu" SET label = 'system.title' WHERE label = 'Sistem';
UPDATE "Menu" SET label = 'system.users' WHERE label = 'Kullanıcılar';
UPDATE "Menu" SET label = 'system.menus' WHERE label = 'Menüler';
UPDATE "Menu" SET label = 'system.roles' WHERE label = 'Roller';
```

---

### **ADIM 4: Nested Translation Support**

**Nested key desteği:**
```tsx
function getNestedTranslation(t: any, key: string): string {
  // "system.users" → t('system.users') veya t.raw('system')['users']
  
  if (key.includes('.')) {
    const parts = key.split('.');
    // Önce doğrudan dene
    try {
      return t(key);
    } catch {
      // Fallback
      return key;
    }
  }
  
  return t(key);
}

function buildMenu(menus: MenuWithChildren[], t: any): MenuItem[] {
  return menus.map(menu => {
    const Icon = Icons[menu.icon as keyof typeof Icons] || Icons.Package
    const translatedLabel = getNestedTranslation(t, menu.label);
    
    return {
      path: menu.path,
      label: translatedLabel,
      icon: <Icon className='size-4' />,
      children: buildMenu(menu.children, t)
    }
  })
}
```

---

## **📝 ÖRNEK MENÜ YAPISININ ÇEVRİLMESİ**

### **Database (Önce):**
```json
{
  "label": "Denetim Sistemi",
  "path": "/denetim",
  "icon": "ClipboardCheck",
  "children": [
    { "label": "Denetimler", "path": "/denetim/audits" },
    { "label": "Planlar", "path": "/denetim/plans" },
    { "label": "Aksiyonlar", "path": "/denetim/actions" }
  ]
}
```

### **Database (Sonra - Translation Key):**
```json
{
  "label": "auditSystem",
  "path": "/denetim",
  "icon": "ClipboardCheck",
  "children": [
    { "label": "audits", "path": "/denetim/audits" },
    { "label": "plans", "path": "/denetim/plans" },
    { "label": "actions", "path": "/denetim/actions" }
  ]
}
```

### **Render (TR):**
```
📋 Denetim Sistemi
  ├─ Denetimler
  ├─ Planlar
  └─ Aksiyonlar
```

### **Render (EN):**
```
📋 Audit System
  ├─ Audits
  ├─ Plans
  └─ Actions
```

---

## **🎨 ADMIN PANEL ENTEGRASYONU**

### **Menu Create/Edit Form:**
```tsx
// Label Key girişi
<FormField
  control={form.control}
  name="label"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Translation Key</FormLabel>
      <FormControl>
        <Input 
          placeholder="navigation.dashboard" 
          {...field} 
        />
      </FormControl>
      <FormDescription>
        Translation key (örn: navigation.dashboard veya navigation.system.users)
      </FormDescription>
    </FormItem>
  )}
/>

// Preview
<div className="p-4 border rounded">
  <p className="text-sm font-medium">Önizleme:</p>
  <p className="text-muted-foreground">
    TR: {t(form.watch('label'))}
  </p>
  <p className="text-muted-foreground">
    EN: {tEn(form.watch('label'))}
  </p>
</div>
```

---

## **✅ TESTING PLAN**

### **Test Scenarios:**
1. ✅ Dil değiştiğinde menü güncelleniyor mu?
2. ✅ Nested menu'ler çalışıyor mu?
3. ✅ Fallback (key bulunamazsa) çalışıyor mu?
4. ✅ Icon'lar görünüyor mu?
5. ✅ Permission-based menu filtering çalışıyor mu?
6. ✅ Mobile menu çalışıyor mu?

---

## **📊 IMPLEMENTATION CHECKLIST**

- [ ] **Adım 1:** navigation.json dosyaları oluştur (TR + EN)
- [ ] **Adım 2:** Sidebar component'i güncelle
- [ ] **Adım 3:** getNestedTranslation helper ekle
- [ ] **Adım 4:** Database migration hazırla
- [ ] **Adım 5:** Migration çalıştır
- [ ] **Adım 6:** Test et (TR/EN switch)
- [ ] **Adım 7:** Admin panel'e preview ekle
- [ ] **Adım 8:** Documentation güncelle

---

## **🚀 DEPLOYMENT STRATEGY**

### **Phase 1: Preparation (1 saat)**
1. Translation dosyaları oluştur
2. Component kodunu yaz
3. Test et (local)

### **Phase 2: Migration (30 dakika)**
1. Database backup al
2. Migration SQL çalıştır
3. Verify data

### **Phase 3: Deployment (15 dakika)**
1. Code deploy
2. Smoke test
3. Monitor

**TOPLAM SÜRe:** ~2 saat

---

## **⚠️ RİSKLER & MİTİGATION**

### **Risk 1: Migration hatası**
**Mitigation:** 
- Önce staging'de test et
- Backup al
- Rollback planı hazır olsun

### **Risk 2: Translation key eksik**
**Mitigation:**
- Fallback kullan (key bulunamazsa label'ı göster)
- Validation ekle

### **Risk 3: Cache problemi**
**Mitigation:**
- .next klasörünü temizle
- Server restart

---

## **📚 DOKÜMANTASYON**

### **README Update:**
```markdown
## Menu i18n

Menü label'ları translation key olarak kullanılır:

### Translation Key Format:
- Basit: `navigation.dashboard`
- Nested: `navigation.system.users`

### Yeni Menu Ekleme:
1. Translation dosyalarına key ekle (tr/en)
2. Database'e key ile kaydet
3. Preview kontrol et
```

---

## **🎉 BEKLENen SONUÇ**

```
┌─────────────────────────────────────────┐
│  MENU i18n TAMAMLANDI! 🌍              │
├─────────────────────────────────────────┤
│  ✅ Dil değişimi anında güncelleniyor  │
│  ✅ Tüm menü label'ları çevrildi       │
│  ✅ Admin panel preview çalışıyor      │
│  ✅ Nested menu'ler destekleniyor      │
│  ✅ Fallback mekanizması var           │
│  ✅ Production ready!                   │
└─────────────────────────────────────────┘
```

---

**Hazırlayan:** Cascade AI  
**Tarih:** 24 Ekim 2025  
**Status:** 📋 Planning Complete - Implementation Ready!
