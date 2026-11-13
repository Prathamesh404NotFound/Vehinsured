import { ref, get, set, remove, push, child, onValue, off } from 'firebase/database';
import { rtdb, isFirebaseConfigured } from '../firebase/config';
import {
  UserProfile,
  Vehicle,
  InsurancePolicy,
  ClaimAssistanceCase,
  DamageAssessment,
  DocumentItem,
  AdminReview,
  CostReferenceItem,
  ActivityLogItem
} from '../../types';
import { DEFAULT_COST_REFERENCES } from '../cost-estimation/calculator';

// Helper for local storage key generation when offline/demo
function getLocalKey(path: string): string {
  return 'rtdb_mock_' + path.replace(/\//g, '_');
}

function readLocalStorage<T>(path: string): T | null {
  try {
    const raw = localStorage.getItem(getLocalKey(path));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLocalStorage<T>(path: string, data: T): void {
  try {
    localStorage.setItem(getLocalKey(path), JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage write error:', e);
  }
}

function deleteLocalStorage(path: string): void {
  try {
    localStorage.removeItem(getLocalKey(path));
  } catch {}
}

// ---------------- USER PROFILES ----------------
export async function dbGetUserProfile(uid: string): Promise<UserProfile | null> {
  if (isFirebaseConfigured && rtdb) {
    const snapshot = await get(ref(rtdb, `profiles/${uid}`));
    return snapshot.exists() ? (snapshot.val() as UserProfile) : null;
  }
  return readLocalStorage<UserProfile>(`profiles/${uid}`);
}

export async function dbSaveUserProfile(profile: UserProfile): Promise<void> {
  if (isFirebaseConfigured && rtdb) {
    await set(ref(rtdb, `profiles/${profile.uid}`), profile);
  }
  writeLocalStorage(`profiles/${profile.uid}`, profile);
}

// ---------------- VEHICLES ----------------
export async function dbGetVehicles(uid: string): Promise<Vehicle[]> {
  if (isFirebaseConfigured && rtdb) {
    const snapshot = await get(ref(rtdb, `vehicles/${uid}`));
    if (!snapshot.exists()) return [];
    const val = snapshot.val();
    return Object.values(val) as Vehicle[];
  }
  const localMap = readLocalStorage<Record<string, Vehicle>>(`vehicles_${uid}`) || {};
  return Object.values(localMap);
}

export async function dbSaveVehicle(uid: string, vehicle: Vehicle): Promise<void> {
  if (isFirebaseConfigured && rtdb) {
    await set(ref(rtdb, `vehicles/${uid}/${vehicle.id}`), vehicle);
  }
  const localMap = readLocalStorage<Record<string, Vehicle>>(`vehicles_${uid}`) || {};
  localMap[vehicle.id] = vehicle;
  writeLocalStorage(`vehicles_${uid}`, localMap);
}

export async function dbDeleteVehicle(uid: string, vehicleId: string): Promise<void> {
  if (isFirebaseConfigured && rtdb) {
    await remove(ref(rtdb, `vehicles/${uid}/${vehicleId}`));
  }
  const localMap = readLocalStorage<Record<string, Vehicle>>(`vehicles_${uid}`) || {};
  delete localMap[vehicleId];
  writeLocalStorage(`vehicles_${uid}`, localMap);
}

// ---------------- POLICIES ----------------
export async function dbGetPolicies(uid: string): Promise<InsurancePolicy[]> {
  if (isFirebaseConfigured && rtdb) {
    const snapshot = await get(ref(rtdb, `policies/${uid}`));
    if (!snapshot.exists()) return [];
    return Object.values(snapshot.val()) as InsurancePolicy[];
  }
  const localMap = readLocalStorage<Record<string, InsurancePolicy>>(`policies_${uid}`) || {};
  return Object.values(localMap);
}

export async function dbSavePolicy(uid: string, policy: InsurancePolicy): Promise<void> {
  if (isFirebaseConfigured && rtdb) {
    await set(ref(rtdb, `policies/${uid}/${policy.id}`), policy);
  }
  const localMap = readLocalStorage<Record<string, InsurancePolicy>>(`policies_${uid}`) || {};
  localMap[policy.id] = policy;
  writeLocalStorage(`policies_${uid}`, localMap);
}

// ---------------- CLAIMS / CASSETTE ----------------
export async function dbGetClaims(uid: string): Promise<ClaimAssistanceCase[]> {
  if (isFirebaseConfigured && rtdb) {
    const snapshot = await get(ref(rtdb, `claims/${uid}`));
    if (!snapshot.exists()) return [];
    return Object.values(snapshot.val()) as ClaimAssistanceCase[];
  }
  const localMap = readLocalStorage<Record<string, ClaimAssistanceCase>>(`claims_${uid}`) || {};
  return Object.values(localMap);
}

export async function dbGetClaimById(uid: string, claimId: string): Promise<ClaimAssistanceCase | null> {
  if (isFirebaseConfigured && rtdb) {
    const snapshot = await get(ref(rtdb, `claims/${uid}/${claimId}`));
    return snapshot.exists() ? (snapshot.val() as ClaimAssistanceCase) : null;
  }
  const localMap = readLocalStorage<Record<string, ClaimAssistanceCase>>(`claims_${uid}`) || {};
  return localMap[claimId] || null;
}

export async function dbSaveClaim(uid: string, claim: ClaimAssistanceCase): Promise<void> {
  if (isFirebaseConfigured && rtdb) {
    await set(ref(rtdb, `claims/${uid}/${claim.id}`), claim);
  }
  const localMap = readLocalStorage<Record<string, ClaimAssistanceCase>>(`claims_${uid}`) || {};
  localMap[claim.id] = claim;
  writeLocalStorage(`claims_${uid}`, localMap);
}

export async function dbDeleteClaim(uid: string, claimId: string): Promise<void> {
  if (isFirebaseConfigured && rtdb) {
    await remove(ref(rtdb, `claims/${uid}/${claimId}`));
  }
  const localMap = readLocalStorage<Record<string, ClaimAssistanceCase>>(`claims_${uid}`) || {};
  delete localMap[claimId];
  writeLocalStorage(`claims_${uid}`, localMap);
}

// ---------------- ASSESSMENTS ----------------
export async function dbSaveAssessment(uid: string, assessment: DamageAssessment): Promise<void> {
  if (isFirebaseConfigured && rtdb) {
    await set(ref(rtdb, `assessments/${uid}/${assessment.id}`), assessment);
  }
  const localMap = readLocalStorage<Record<string, DamageAssessment>>(`assessments_${uid}`) || {};
  localMap[assessment.id] = assessment;
  writeLocalStorage(`assessments_${uid}`, localMap);
}

export async function dbGetAssessmentById(uid: string, assessmentId: string): Promise<DamageAssessment | null> {
  if (isFirebaseConfigured && rtdb) {
    const snapshot = await get(ref(rtdb, `assessments/${uid}/${assessmentId}`));
    return snapshot.exists() ? (snapshot.val() as DamageAssessment) : null;
  }
  const localMap = readLocalStorage<Record<string, DamageAssessment>>(`assessments_${uid}`) || {};
  return localMap[assessmentId] || null;
}

// ---------------- DOCUMENTS ----------------
export async function dbGetDocuments(uid: string): Promise<DocumentItem[]> {
  if (isFirebaseConfigured && rtdb) {
    const snapshot = await get(ref(rtdb, `documents/${uid}`));
    if (!snapshot.exists()) return [];
    return Object.values(snapshot.val()) as DocumentItem[];
  }
  const localMap = readLocalStorage<Record<string, DocumentItem>>(`documents_${uid}`) || {};
  return Object.values(localMap);
}

export async function dbSaveDocument(uid: string, doc: DocumentItem): Promise<void> {
  if (isFirebaseConfigured && rtdb) {
    await set(ref(rtdb, `documents/${uid}/${doc.id}`), doc);
  }
  const localMap = readLocalStorage<Record<string, DocumentItem>>(`documents_${uid}`) || {};
  localMap[doc.id] = doc;
  writeLocalStorage(`documents_${uid}`, localMap);
}

// ---------------- ADMIN REVIEWS ----------------
export async function dbGetAdminReview(claimId: string): Promise<AdminReview | null> {
  if (isFirebaseConfigured && rtdb) {
    const snapshot = await get(ref(rtdb, `adminReviews/${claimId}`));
    return snapshot.exists() ? (snapshot.val() as AdminReview) : null;
  }
  return readLocalStorage<AdminReview>(`adminReviews_${claimId}`);
}

export async function dbSaveAdminReview(review: AdminReview): Promise<void> {
  if (isFirebaseConfigured && rtdb) {
    await set(ref(rtdb, `adminReviews/${review.claimId}`), review);
  }
  writeLocalStorage(`adminReviews_${review.claimId}`, review);
}

export async function dbGetAllSubmittedClaimsForAdmin(): Promise<{ uid: string; claim: ClaimAssistanceCase }[]> {
  if (isFirebaseConfigured && rtdb) {
    const snapshot = await get(ref(rtdb, 'claims'));
    if (!snapshot.exists()) return [];
    const allUsersClaims = snapshot.val();
    const result: { uid: string; claim: ClaimAssistanceCase }[] = [];
    Object.keys(allUsersClaims).forEach((uid) => {
      const userClaims = allUsersClaims[uid];
      Object.values(userClaims).forEach((c: any) => {
        result.push({ uid, claim: c as ClaimAssistanceCase });
      });
    });
    return result;
  }

  // Fallback scan local storage keys
  const result: { uid: string; claim: ClaimAssistanceCase }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('rtdb_mock_claims_')) {
      const uid = key.replace('rtdb_mock_claims_', '');
      const map = readLocalStorage<Record<string, ClaimAssistanceCase>>(`claims_${uid}`) || {};
      Object.values(map).forEach((claim) => {
        result.push({ uid, claim });
      });
    }
  }
  return result;
}

// ---------------- REFERENCE COSTS ----------------
export async function dbGetReferenceCosts(): Promise<CostReferenceItem[]> {
  if (isFirebaseConfigured && rtdb) {
    const snapshot = await get(ref(rtdb, 'referenceCosts'));
    if (snapshot.exists()) {
      return Object.values(snapshot.val()) as CostReferenceItem[];
    }
  }
  const localRef = readLocalStorage<CostReferenceItem[]>('referenceCosts');
  return localRef || DEFAULT_COST_REFERENCES;
}

export async function dbSaveReferenceCostItem(item: CostReferenceItem): Promise<void> {
  if (isFirebaseConfigured && rtdb) {
    await set(ref(rtdb, `referenceCosts/${item.id}`), item);
  }
  const current = await dbGetReferenceCosts();
  const index = current.findIndex((c) => c.id === item.id);
  if (index >= 0) {
    current[index] = item;
  } else {
    current.push(item);
  }
  writeLocalStorage('referenceCosts', current);
}

// ---------------- ACTIVITY LOGS ----------------
export async function dbGetActivityLogs(uid: string): Promise<ActivityLogItem[]> {
  if (isFirebaseConfigured && rtdb) {
    const snapshot = await get(ref(rtdb, `activityLogs/${uid}`));
    if (!snapshot.exists()) return [];
    return Object.values(snapshot.val()) as ActivityLogItem[];
  }
  return readLocalStorage<ActivityLogItem[]>(`activityLogs_${uid}`) || [];
}

export async function dbAddActivityLog(uid: string, item: Omit<ActivityLogItem, 'id' | 'timestamp'>): Promise<void> {
  const log: ActivityLogItem = {
    ...item,
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    uid,
    timestamp: Date.now()
  };

  if (isFirebaseConfigured && rtdb) {
    await set(ref(rtdb, `activityLogs/${uid}/${log.id}`), log);
  }
  const current = readLocalStorage<ActivityLogItem[]>(`activityLogs_${uid}`) || [];
  current.unshift(log);
  writeLocalStorage(`activityLogs_${uid}`, current.slice(0, 50));
}
