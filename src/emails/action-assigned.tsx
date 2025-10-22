import * as React from 'react';
import { Text } from '@react-email/components';
import { BaseTemplate } from './layouts/base-template';

interface ActionAssignedEmailProps {
  userName: string;
  actionDetails: string;
  findingDetails: string;
  managerName: string;
  actionUrl: string;
}

export function ActionAssignedEmail({
  userName,
  actionDetails,
  findingDetails,
  managerName,
  actionUrl,
}: ActionAssignedEmailProps) {
  return (
    <BaseTemplate
      preview="Size yeni bir aksiyon atandı"
      title="⚡ Yeni Aksiyon Atandı"
      actionUrl={actionUrl}
      actionText="Aksiyonu Görüntüle"
    >
      <Text style={greeting}>Merhaba {userName},</Text>
      
      <Text style={paragraph}>
        Size yeni bir aksiyon sorumluluğu verildi.
      </Text>

      <div style={infoBox}>
        <Text style={infoLabel}>Aksiyon:</Text>
        <Text style={infoValue}>{actionDetails}</Text>
        
        <Text style={infoLabel}>İlgili Bulgu:</Text>
        <Text style={infoValue}>{findingDetails}</Text>
        
        <Text style={infoLabel}>Onaylayacak Yönetici:</Text>
        <Text style={infoValue}>{managerName}</Text>
      </div>

      <Text style={paragraph}>
        Lütfen aksiyonu tamamlayıp yönetici onayına gönderin.
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
