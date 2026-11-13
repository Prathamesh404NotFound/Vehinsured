export type SupportedLanguage = 'en' | 'hi' | 'mr';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  language: SupportedLanguage;
  createdAt: number;
  updatedAt: number;
  isAdmin?: boolean;
}

export type VehicleCategory = 'hatchback' | 'sedan' | 'suv' | 'luxury' | 'two_wheeler' | 'commercial';

export type FuelType = 'petrol' | 'diesel' | 'electric' | 'cng' | 'hybrid';

export interface Vehicle {
  id: string;
  uid: string;
  registrationNumber: string; // Normalized (e.g., MH12AB1234)
  displayRegistrationNumber: string; // Formatted (e.g., MH 12 AB 1234)
  make: string;
  model: string;
  variant?: string;
  manufacturingYear: number;
  category: VehicleCategory;
  fuelType?: FuelType;
  color?: string;
  ownerRelationship: 'self' | 'spouse' | 'parent' | 'child' | 'employer' | 'other';
  policyId?: string;
  photoPreview?: string; // Compressed base64
  createdAt: number;
  updatedAt: number;
}

export interface InsurancePolicy {
  id: string;
  uid: string;
  insurerName: string;
  policyNumber: string;
  policyType: 'comprehensive' | 'third_party' | 'zero_depreciation' | 'pay_as_you_drive';
  startDate: string;
  expiryDate: string;
  vehicleId: string;
  policyholderName: string;
  coverageNotes?: string;
  documentId?: string;
  isVerifiedByAdmin?: boolean;
  isExtractedByOcr?: boolean;
  updatedAt: number;
}

export interface EvidenceImage {
  id: string;
  caption: string;
  previewBase64: string; // Compressed <200KB preview stored in RTDB
  hasLocalOriginal: boolean; // Flag indicating high-res original in IndexedDB
  originalKey?: string;
  createdAt: number;
}

export type DamageSeverity = 'minor' | 'moderate' | 'severe' | 'unable_to_determine';

export interface DamagedRegion {
  id: string;
  partName: string; // e.g. "Front Bumper", "Headlight Left", "Bonnet"
  damageType: 'dent' | 'scratch' | 'crack' | 'broken' | 'alignment' | 'other';
  severity: DamageSeverity;
  confidence?: number; // 0.0 - 1.0 (Only present for actual model outputs)
  bbox?: [number, number, number, number]; // [x, y, width, height] normalized
  userDescription?: string;
  isUserAddedOrCorrected?: boolean;
}

export interface DamageAssessment {
  id: string;
  claimId: string;
  uid: string;
  inferenceMethod: 'onnx_local' | 'gemini_vision' | 'manual_user';
  modelIdentifier: string; // e.g. "YOLOv8-Vehicle-Damage-v1" or "Gemini-Vision" or "Manual-Assessment"
  status: 'completed' | 'model_unavailable' | 'failed' | 'manual_only';
  statusMessage?: string;
  regions: DamagedRegion[];
  isVehicleDrivableAccordingToUser: boolean;
  safetyNoticeRequired: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface DocumentItem {
  id: string;
  uid: string;
  claimId?: string;
  category: 'rc' | 'insurance_policy' | 'driving_licence' | 'fir' | 'repair_estimate' | 'invoice' | 'death_certificate' | 'relationship_proof' | 'other';
  fileName: string;
  fileType: string;
  fileSize: number;
  previewBase64?: string;
  extractedFields: Record<string, string>;
  isConfirmedByUser: boolean;
  confidenceScore?: number;
  uploadedAt: number;
}

export interface ClaimAssistanceCase {
  id: string;
  uid: string;
  caseReference: string; // e.g. "CLAIM-202610-8492"
  vehicleId: string;
  policyId?: string;
  incidentDate: string;
  incidentTime: string;
  location: string;
  description: string;
  typeOfIncident: 'single_vehicle' | 'multi_vehicle' | 'hit_and_run' | 'parked_vandalism' | 'natural_calamity';
  otherVehicleInvolved: boolean;
  isDrivable: boolean;
  policeFirReference?: string;
  witnessNotes?: string;
  evidenceList: EvidenceImage[];
  isDeceasedCase: boolean; // Nominee / Legal Heir Workflow
  nomineeDetails?: {
    policyholderName: string;
    relationshipToPolicyholder: string;
    applicantName: string;
    contactNumber?: string;
    insurerContacted: boolean;
  };
  status: 'draft' | 'ready_for_submission' | 'submitted_for_review' | 'under_review' | 'more_info_required' | 'review_complete' | 'closed';
  assessmentId?: string;
  documentIds: string[];
  currentWizardStep: number;
  createdAt: number;
  updatedAt: number;
}

export interface CostReferenceItem {
  id: string;
  partName: string;
  category: VehicleCategory;
  repairLaborMin: number;
  repairLaborMax: number;
  replacePartsMin: number;
  replacePartsMax: number;
  paintingAllowanceMin: number;
  paintingAllowanceMax: number;
  lastUpdated: number;
  updatedBy: string;
}

export interface ComponentEstimate {
  partName: string;
  suggestedOperation: 'repair' | 'replace' | 'inspect';
  partsCostMin: number;
  partsCostMax: number;
  laborCostMin: number;
  laborCostMax: number;
  paintingCostMin: number;
  paintingCostMax: number;
  subtotalMin: number;
  subtotalMax: number;
}

export interface CostEstimateResult {
  vehicleCategory: VehicleCategory;
  components: ComponentEstimate[];
  totalMin: number;
  totalMax: number;
  assumptions: string[];
  referenceTableVersion: string;
  lastUpdatedDate: string;
  disclaimer: string;
}

export interface AdminReview {
  claimId: string;
  status: ClaimAssistanceCase['status'];
  reviewerUid: string;
  reviewerEmail?: string;
  reviewerNotes?: string;
  recordedInsurerDecision?: 'pending' | 'approved_indicative' | 'rejected_by_insurer' | 'under_investigation';
  requestedCustomerClarification?: string;
  history: Array<{
    timestamp: number;
    reviewerUid: string;
    oldStatus: string;
    newStatus: string;
    comment: string;
  }>;
  updatedAt: number;
}

export interface ActivityLogItem {
  id: string;
  uid: string;
  title: string;
  description: string;
  timestamp: number;
  type: 'claim' | 'vehicle' | 'document' | 'review';
}
