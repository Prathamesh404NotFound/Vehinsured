import { ClaimAssistanceCase } from '../types';

export const MAX_IMAGE_FILE_BYTES = 15 * 1024 * 1024; // 15MB raw upload cap
export const MAX_RTDB_PREVIEW_KB = 200; // 200KB RTDB compressed limit
export const MAX_EVIDENCE_PER_CASE = 10;

export function normalizeRegistrationNumber(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function formatRegistrationNumber(input: string): string {
  const norm = normalizeRegistrationNumber(input);
  const indianFormat = norm.match(/^([A-Z]{2})([0-9]{2})([A-Z]{1,3})([0-9]{1,4})$/);
  if (indianFormat) {
    return `${indianFormat[1]} ${indianFormat[2]} ${indianFormat[3]} ${indianFormat[4]}`;
  }
  return norm;
}

export function isValidRegistrationNumber(input: string): boolean {
  const norm = normalizeRegistrationNumber(input);
  return norm.length >= 6 && norm.length <= 12 && /^[A-Z0-9]+$/.test(norm);
}

export function validateEvidenceFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `Unsupported file type (${file.type || 'unknown'}). Upload JPEG, PNG, or WEBP images.` };
  }
  if (file.size > MAX_IMAGE_FILE_BYTES) {
    return { valid: false, error: 'Image exceeds 15 MB raw upload limit.' };
  }
  return { valid: true };
}

export function validateDocumentFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Unsupported document format. Please upload a JPEG, PNG, WEBP image or PDF file.' };
  }
  if (file.size > 20 * 1024 * 1024) {
    return { valid: false, error: 'Document exceeds 20 MB maximum file size.' };
  }
  return { valid: true };
}

export function isValidDateRange(startDate: string, expiryDate: string): boolean {
  if (!expiryDate) return false;
  if (!startDate) return true;
  return new Date(expiryDate).getTime() >= new Date(startDate).getTime();
}

export function canCustomerEditClaim(status: ClaimAssistanceCase['status']): boolean {
  return status === 'draft' || status === 'ready_for_submission' || status === 'more_info_required';
}

export function isAllowedStatusTransition(
  currentStatus: ClaimAssistanceCase['status'],
  nextStatus: ClaimAssistanceCase['status'],
  isAdmin: boolean
): boolean {
  if (currentStatus === nextStatus) return true;
  if (!isAdmin) {
    if (currentStatus === 'draft') {
      return ['ready_for_submission', 'submitted_for_review'].includes(nextStatus);
    }
    if (currentStatus === 'ready_for_submission' || currentStatus === 'more_info_required') {
      return nextStatus === 'submitted_for_review' || nextStatus === 'draft';
    }
    return false;
  }
  // Admin transitions
  return [
    'draft',
    'ready_for_submission',
    'submitted_for_review',
    'under_review',
    'more_info_required',
    'review_complete',
    'closed',
  ].includes(nextStatus);
}

export function canUserAccessRecord(recordOwnerUid: string, currentUid: string | undefined, isAdmin: boolean): boolean {
  if (!currentUid) return false;
  if (isAdmin) return true;
  return recordOwnerUid === currentUid;
}
