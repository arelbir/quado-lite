import * as React from 'react';
import { Text } from '@react-email/components';
import { BaseTemplate } from './layouts/base-template';

interface DofAssignedEmailProps {
  userName: string;
  dofTitle: string;
  problemDetails: string;
  managerName: string;
  actionUrl: string;
}

export function DofAssignedEmail({
  userName,
  dofTitle,
  problemDetails,
  managerName,
  actionUrl,
}: DofAssignedEmailProps) {
  return (
    <BaseTemplate
      preview={`Yeni DÖF atandı: ${dofTitle}`}
      title="📑 Yeni DÖF (CAPA) Atandı"
      actionUrl={actionUrl}
      actionText="DÖF'ü Görüntüle"
    >
      <Text style={greeting}>Merhaba {userName},</Text>
      
      <Text style={paragraph}>
        Size yeni bir DÖF (Düzeltici/Önleyici Faaliyet) sorumluluğu verildi.
      </Text>

      <div style={infoBox}>
        <Text style={infoLabel}>DÖF Başlığı:</Text>
        <Text style={infoValue}>{dofTitle}</Text>
        
        <Text style={infoLabel}>Problem Tanımı:</Text>
        <Text style={infoValue}>{problemDetails}</Text>
        
        <Text style={infoLabel}>Onaylayacak Yönetici:</Text>
        <Text style={infoValue}>{managerName}</Text>
      </div>

      <div style={stepsBox}>
        <Text style={stepsTitle}>7 Adımlı DÖF Süreci:</Text>
        <Text style={stepItem}>1️⃣ Problem Tanımı (5N1K)</Text>
        <Text style={stepItem}>2️⃣ Geçici Önlemler</Text>
        <Text style={stepItem}>3️⃣ Kök Neden Analizi</Text>
        <Text style={stepItem}>4️⃣ Faaliyetler</Text>
        <Text style={stepItem}>5️⃣ Uygulama</Text>
        <Text style={stepItem}>6️⃣ Etkinlik Kontrolü</Text>
        <Text style={stepItem}>7️⃣ Kapanış ve Onay</Text>
      </div>

      <Text style={paragraph}>
        Lütfen DÖF sürecini takip ederek tüm adımları tamamlayın.
      </Text>
    </BaseTemplate>
  );
}

const greeting = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#111827',
  marginBottom: '16px',
};

const paragraph = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#374151',
  marginBottom: '16px',
};

const infoBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  padding: '16px',
  marginBottom: '16px',
};

const infoLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#6b7280',
  marginBottom: '4px',
  marginTop: '8px',
};

const infoValue = {
  fontSize: '14px',
  color: '#111827',
  marginTop: '0',
  marginBottom: '0',
};

const stepsBox = {
  backgroundColor: '#eff6ff',
  border: '1px solid #bfdbfe',
  borderRadius: '6px',
  padding: '16px',
  marginBottom: '16px',
};

const stepsTitle = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#1e40af',
  marginBottom: '8px',
};

const stepItem = {
  fontSize: '13px',
  color: '#374151',
  margin: '4px 0',
};
