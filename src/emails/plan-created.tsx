import * as React from 'react';
import { Text } from '@react-email/components';
import { BaseTemplate } from './layouts/base-template';

interface PlanCreatedEmailProps {
  userName: string;
  auditTitle: string;
  scheduledDate: string;
  templateName: string;
  actionUrl: string;
}

export function PlanCreatedEmail({
  userName,
  auditTitle,
  scheduledDate,
  templateName,
  actionUrl,
}: PlanCreatedEmailProps) {
  return (
    <BaseTemplate
      preview={`Planlı denetim oluşturuldu: ${auditTitle}`}
      title="📅 Planlı Denetim Oluşturuldu"
      actionUrl={actionUrl}
      actionText="Denetimi Görüntüle"
    >
      <Text style={greeting}>Merhaba {userName},</Text>
      
      <Text style={paragraph}>
        Planlanmış denetiminiz otomatik olarak oluşturuldu ve sorularını cevaplamaya hazır.
      </Text>

      <div style={infoBox}>
        <Text style={infoLabel}>Denetim:</Text>
        <Text style={infoValue}>{auditTitle}</Text>
        
        <Text style={infoLabel}>Planlanan Tarih:</Text>
        <Text style={infoValue}>{scheduledDate}</Text>
        
        <Text style={infoLabel}>Kullanılan Şablon:</Text>
        <Text style={infoValue}>{templateName}</Text>
      </div>

      <Text style={paragraph}>
        Denetim sorularını cevaplayabilir ve bulguları kaydedebilirsiniz.
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
