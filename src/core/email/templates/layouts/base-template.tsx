import * as React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components';

interface BaseTemplateProps {
  preview: string;
  title: string;
  children: React.ReactNode;
  actionUrl?: string;
  actionText?: string;
}

export function BaseTemplate({
  preview,
  title,
  children,
  actionUrl,
  actionText,
}: BaseTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerText}>
              🔍 Denetim Yönetim Sistemi
            </Text>
          </Section>

          {/* Title */}
          <Section style={titleSection}>
            <Text style={titleText}>{title}</Text>
          </Section>

          {/* Content */}
          <Section style={content}>{children}</Section>

          {/* Action Button */}
          {actionUrl && actionText && (
            <Section style={buttonSection}>
              <Button style={button} href={actionUrl}>
                {actionText}
              </Button>
            </Section>
          )}

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              Bu otomatik bir bildirimdir. Lütfen bu e-postayı yanıtlamayın.
            </Text>
            <Text style={footerText}>
              © 2025 Denetim Yönetim Sistemi
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 32px 0',
};

const headerText = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0',
};

const titleSection = {
  padding: '24px 32px 0',
};

const titleText = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#374151',
  margin: '0',
};

const content = {
  padding: '24px 32px',
};

const buttonSection = {
  padding: '0 32px 32px',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '20px 32px',
};

const footer = {
  padding: '0 32px',
};

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '4px 0',
};
