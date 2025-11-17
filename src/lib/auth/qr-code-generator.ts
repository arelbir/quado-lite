/**
 * QR CODE GENERATOR
 * Generate QR codes for 2FA setup
 */

/**
 * Generate QR code as Data URL
 * Using a simple inline SVG approach (no external dependencies)
 */
export async function generateQRCode(text: string): Promise<string> {
  // For production, use a proper QR code library like 'qrcode'
  // This is a simplified implementation for demonstration
  
  try {
    // Dynamic import to avoid SSR issues
    const QRCode = (await import('qrcode')).default;
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 300,
    });
  } catch (error) {
    console.error('[QR] Generation failed:', error);
    // Fallback: return a placeholder
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="%23f0f0f0"/><text x="150" y="150" text-anchor="middle" font-size="14">QR Code</text></svg>`;
  }
}

/**
 * Generate QR code as SVG string
 */
export async function generateQRCodeSVG(text: string): Promise<string> {
  try {
    const QRCode = (await import('qrcode')).default;
    return await QRCode.toString(text, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 1,
    });
  } catch (error) {
    console.error('[QR] SVG generation failed:', error);
    return '<svg></svg>';
  }
}
