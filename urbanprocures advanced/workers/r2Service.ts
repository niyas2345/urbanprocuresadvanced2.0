// Urban Procures Advanced
// Cloudflare R2 Document Storage Service & Security Controls

import { DocumentMetadata } from '../shared/types.ts';

export class R2DocumentService {
  /**
   * Generates a safe storage key for R2
   */
  public static generateObjectKey(prefix: 'rfq' | 'quotes' | 'licenses', id: string, fileName: string): string {
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    return `${prefix}/${id}/${timestamp}_${sanitizedName}`;
  }

  /**
   * Generates a secure, time-bound signed access URL (Simulated for Worker Edge)
   */
  public static getSecureDownloadUrl(objectKey: string, ttlSeconds: number = 900): string {
    // In production Cloudflare Workers with R2:
    // Signed URLs can be generated with AwsClient or Worker presigned endpoints.
    // For local & preview environment, we route through secure API proxy with token:
    const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
    return `/api/documents/download?key=${encodeURIComponent(objectKey)}&exp=${expiresAt}&sig=token_${Date.now().toString(36)}`;
  }

  /**
   * Validates document MIME type and file size
   */
  public static validateUpload(fileName: string, mimeType: string, sizeBytes: number): { valid: boolean; reason?: string } {
    const maxSizeBytes = 25 * 1024 * 1024; // 25 MB max
    if (sizeBytes > maxSizeBytes) {
      return { valid: false, reason: 'File exceeds maximum permitted size of 25MB' };
    }

    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
      'application/vnd.ms-excel', // xls
      'application/acad', // dwg
      'image/vnd.dwg',
      'application/octet-stream', // dwg / zip fallbacks
    ];

    if (!allowedMimeTypes.includes(mimeType) && !fileName.match(/\.(pdf|jpe?g|png|webp|xlsx?|dwg|dxf|zip)$/i)) {
      return { valid: false, reason: 'Unsupported file type. Permitted: PDF, DWG, XLSX, Images, ZIP' };
    }

    return { valid: true };
  }
}
