import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, History, Car, FileText, Cpu } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import {
  dbGetClaimById,
  dbGetAdminReview,
  dbSaveAdminReview,
  dbSaveClaim,
  dbGetAssessmentById,
  dbGetVehicles,
  dbGetPolicies,
  dbGetDocuments,
} from '../../services/database';
import {
  ClaimAssistanceCase,
  AdminReview,
  DamageAssessment,
  Vehicle,
  InsurancePolicy,
  DocumentItem,
} from '../../types';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ToastBanner } from '../../components/ui/ToastBanner';
import { isAllowedStatusTransition } from '../../utils/validation';

export const CaseDetailsPage: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const uid = searchParams.get('uid');
  const claimId = searchParams.get('claimId');

  const [claim, setClaim] = useState<ClaimAssistanceCase | null>(null);
  const [assessment, setAssessment] = useState<DamageAssessment | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [policy, setPolicy] = useState<InsurancePolicy | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [review, setReview] = useState<AdminReview | null>(null);

  const [newStatus, setNewStatus] = useState<ClaimAssistanceCase['status']>('under_review');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [clarificationRequest, setClarificationRequest] = useState('');
  const [recordedDecision, setRecordedDecision] = useState<AdminReview['recordedInsurerDecision']>('pending');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!uid || !claimId) {
      setLoading(false);
      return;
    }
    async function load() {
      setLoading(true);
      try {
        const c = await dbGetClaimById(uid!, claimId!);
        if (c) {
          setClaim(c);
          setNewStatus(c.status);
          const [vList, pList, rev, ass, docs] = await Promise.all([
            dbGetVehicles(uid!),
            dbGetPolicies(uid!),
            dbGetAdminReview(claimId!),
            c.assessmentId ? dbGetAssessmentById(uid!, c.assessmentId) : Promise.resolve(null),
            dbGetDocuments(uid!),
          ]);
          setVehicle(vList.find((v) => v.id === c.vehicleId) || null);
          setPolicy(pList.find((p) => p.id === c.policyId) || null);
          setAssessment(ass);
          setDocuments(docs);
          if (rev) {
            setReview(rev);
            setReviewerNotes(rev.reviewerNotes || '');
            setClarificationRequest(rev.requestedCustomerClarification || '');
            if (rev.recordedInsurerDecision) setRecordedDecision(rev.recordedInsurerDecision);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [uid, claimId]);

  if (!isAdmin) {
    return <div className="p-8 text-center text-xs text-slate-500">Access Restricted</div>;
  }

  const executeSaveReview = async () => {
    if (!claim || !currentUser) return;
    setConfirmOpen(false);
    if (!isAllowedStatusTransition(claim.status, newStatus, isAdmin)) {
      setBanner({ type: 'error', message: 'Status transition is not permitted.' });
      return;
    }

    setSaving(true);
    const oldStatus = claim.status;
    const updatedClaim: ClaimAssistanceCase = {
      ...claim,
      status: newStatus,
      updatedAt: Date.now(),
    };

    const reviewObj: AdminReview = {
      claimId: claim.id,
      status: newStatus,
      reviewerUid: currentUser.uid,
      reviewerEmail: currentUser.email,
      reviewerNotes,
      requestedCustomerClarification: clarificationRequest,
      recordedInsurerDecision: recordedDecision,
      history: [
        ...(review?.history || []),
        {
          timestamp: Date.now(),
          reviewerUid: currentUser.uid,
          oldStatus,
          newStatus,
          comment: reviewerNotes || 'Review status updated',
        },
      ],
      updatedAt: Date.now(),
    };

    await dbSaveClaim(claim.uid, updatedClaim);
    await dbSaveAdminReview(reviewObj);
    setClaim(updatedClaim);
    setReview(reviewObj);
    setSaving(false);
    setBanner({ type: 'success', message: `Review status updated to ${newStatus.replace(/_/g, ' ').toUpperCase()}.` });
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading Case Details...</div>;
  }

  if (!claim) {
    return (
      <div className="p-12 text-center space-y-3">
        <p className="text-sm font-medium text-slate-700">Case record not found.</p>
        <Button size="sm" onClick={() => navigate('/admin')}>
          Return to Review Queue
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-blue-600 uppercase">Case: {claim.caseReference}</span>
              <StatusBadge status={claim.status} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Review Case Details</h1>
          </div>
        </div>
      </div>

      {banner && <ToastBanner type={banner.type} message={banner.message} onClose={() => setBanner(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Vehicle/Policy, Incident, Assessment, Evidence, Docs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-600" />
              <span>Vehicle, Policy & Incident Details</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              <p>
                <strong>Vehicle:</strong> {vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.displayRegistrationNumber})` : 'N/A'}
              </p>
              <p>
                <strong>Policy:</strong> {policy ? `${policy.insurerName} (${policy.policyNumber})` : 'Not Linked'}
              </p>
              <p>
                <strong>Incident Date:</strong> {claim.incidentDate} {claim.incidentTime}
              </p>
              <p>
                <strong>Locality:</strong> {claim.location || 'Not entered'}
              </p>
              <p>
                <strong>Type:</strong> {claim.typeOfIncident.replace(/_/g, ' ').toUpperCase()}
              </p>
              <p>
                <strong>Drivable:</strong> {claim.isDrivable ? 'Yes' : 'No (Requires Towing)'}
              </p>
              <p>
                <strong>FIR Reference:</strong> {claim.policeFirReference || 'None'}
              </p>
              <p>
                <strong>Deceased Policyholder Case:</strong> {claim.isDeceasedCase ? 'Yes' : 'No'}
              </p>
            </div>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <strong>Description:</strong> {claim.description || 'None provided'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>Damage Assessment Findings</span>
            </h3>
            {assessment ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  <strong>Method:</strong> {assessment.inferenceMethod.replace(/_/g, ' ').toUpperCase()} ({assessment.modelIdentifier})
                </p>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                  {assessment.regions.map((r) => (
                    <div key={r.id} className="p-2.5 bg-slate-50 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{r.partName}</span>
                        <span className="text-slate-500 ml-2">({r.damageType})</span>
                        {r.confidence !== undefined && (
                          <span className="ml-2 text-[10px] text-blue-700">AI {Math.round(r.confidence * 100)}%</span>
                        )}
                      </div>
                      <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {r.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No damage assessment linked.</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Uploaded Evidence ({claim.evidenceList.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {claim.evidenceList.map((e) => (
                <div key={e.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <img src={e.previewBase64} alt={e.caption} className="h-28 w-full object-cover" />
                  <p className="p-1.5 text-[10px] text-slate-600 truncate">{e.caption}</p>
                </div>
              ))}
            </div>
          </div>

          {documents.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Customer Documents & OCR Fields ({documents.length})</span>
              </h3>
              <div className="space-y-2 text-xs">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900">
                      {doc.fileName} ({doc.category.toUpperCase()})
                    </p>
                    <p className="text-slate-600 mt-0.5">
                      {Object.entries(doc.extractedFields)
                        .filter(([, v]) => Boolean(v))
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' | ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Review Action Form + History */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Update Review Action</h3>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Update Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ClaimAssistanceCase['status'])}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white"
              >
                <option value="draft">Draft</option>
                <option value="submitted_for_review">Submitted for Review</option>
                <option value="under_review">Under Review</option>
                <option value="more_info_required">More Info Required</option>
                <option value="review_complete">Review Complete</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                Recorded Insurer Outcome (Reference)
              </label>
              <select
                value={recordedDecision}
                onChange={(e) => setRecordedDecision(e.target.value as AdminReview['recordedInsurerDecision'])}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white"
              >
                <option value="pending">Pending Insurer Survey</option>
                <option value="under_investigation">Under Insurer Investigation</option>
                <option value="approved_indicative">Approved by Insurer</option>
                <option value="rejected_by_insurer">Rejected by Insurer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Reviewer Internal Notes</label>
              <textarea
                rows={3}
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="Internal audit comments..."
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                Request Customer Clarification
              </label>
              <textarea
                rows={2}
                value={clarificationRequest}
                onChange={(e) => setClarificationRequest(e.target.value)}
                placeholder="Details needed from customer..."
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              ></textarea>
            </div>

            <Button onClick={() => setConfirmOpen(true)} isLoading={saving} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              <span>Save Review Action</span>
            </Button>
          </div>

          {review?.history && review.history.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-600" />
                <span>Audit Trail ({review.history.length})</span>
              </h3>
              <div className="space-y-2.5 text-xs">
                {[...review.history].reverse().map((h, i) => (
                  <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5">
                    <p className="font-bold text-slate-800">
                      {h.oldStatus.replace(/_/g, ' ')} &rarr; {h.newStatus.replace(/_/g, ' ')}
                    </p>
                    <p className="text-slate-600">{h.comment}</p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(h.timestamp).toLocaleString()} &bull; {h.reviewerUid}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirm Case Review Update"
        message={`Update status of ${claim.caseReference} from "${claim.status.replace(/_/g, ' ')}" to "${newStatus.replace(/_/g, ' ')}" and record this action in the audit log?`}
        confirmLabel="Confirm Update"
        cancelLabel="Cancel"
        variant="primary"
        onConfirm={executeSaveReview}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};
