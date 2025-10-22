import * as React from 'react';
import { Text } from '@react-email/components';
import { BaseTemplate } from './layouts/base-template';

interface ActionApprovedEmailProps {
  userName: string;
  actionDetails: string;
  managerName: string;
  actionUrl: string;
}

export function ActionApprovedEmail({
  userName,
  actionDetails,
  managerName,
  actionUrl,
}: ActionApprovedEmailProps) {
  return (
    <BaseTemplate
      preview="Aksiyonunuz onaylandı"
      title="✅ Aksiyon Onaylandı"
      actionUrl={actionUrl}
      actionText="Aksiyonu Görüntüle"
    >
      <Text style={greeting}>Merhaba {userName},</Text>
      
      <Text style={successText}>
        Tamamladığınız aksiyon yönetici tarafından onaylandı!
      </Text>

      <div style={successBox}>
        <Text style={infoLabel}>Aksiyon:</Text>
        <Text style={infoValue}>{actionDetails}</Text>
        
        <Text style={infoLabel}>Onaylayan:</Text>
        <Text style={infoValue}>{managerName}</Text>
      </div>

      <Text style={paragraph}>
        Harika iş çıkardınız! 👏
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

const successText = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#059669',
  fontWeight: '600',
  marginBottom: '16px',
};

const paragraph = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#374151',
  marginBottom: '16px',
};

const successBox = {
  backgroundColor: '#ecfdf5',
  border: '1px solid #a7f3d0',
  borderRadius: '6px',
  padding: '16px',
  marginBottom: '16px',
};

const infoLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#047857',
  marginBottom: '4px',
  marginTop: '8px',
};

const infoValue = {
  fontSize: '14px',
  color: '#111827',
  marginTop: '0',
  marginBottom: '0',
};
