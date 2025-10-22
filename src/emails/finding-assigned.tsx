import * as React from 'react';
import { Text } from '@react-email/components';
import { BaseTemplate } from './layouts/base-template';

interface FindingAssignedEmailProps {
  userName: string;
  findingDetails: string;
  auditTitle: string;
  riskType?: string;
  actionUrl: string;
}

export function FindingAssignedEmail({
  userName,
  findingDetails,
  auditTitle,
  riskType,
  actionUrl,
}: FindingAssignedEmailProps) {
  return (
    <BaseTemplate
      preview={`Yeni bulgu atandı: ${auditTitle}`}
      title="🔔 Yeni Bulgu Atandı"
      actionUrl={actionUrl}
      actionText="Bulguyu Görüntüle"
    >
      <Text style={greeting}>Merhaba {userName},</Text>
      
      <Text style={paragraph}>
        Size yeni bir denetim bulgusunun sorumlusu olarak atandınız.
      </Text>

      <div style={infoBox}>
        <Text style={infoLabel}>Denetim:</Text>
        <Text style={infoValue}>{auditTitle}</Text>
        
        {riskType && (
          <>
            <Text style={infoLabel}>Risk Seviyesi:</Text>
            <Text style={infoValue}>{riskType}</Text>
          </>
        )}
        
        <Text style={infoLabel}>Bulgu Detayı:</Text>
        <Text style={infoValue}>{findingDetails}</Text>
      </div>

      <Text style={paragraph}>
        Lütfen bulguyu inceleyip gerekli aksiyonları başlatın.
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
