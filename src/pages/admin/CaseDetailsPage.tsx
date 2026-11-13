import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Save, CheckCircle2, MessageSquare } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import {
  dbGetClaimById,
  dbGetAdminReview,
  dbSaveAdminReview,
  dbSaveClaim,
  dbGetAssessmentById,
  dbGetVehicles,
  dbGetPolicies
} from '../../services/database';
import { ClaimAssistanceCase, AdminReview, DamageAssessment, Vehicle, InsurancePolicy } from '../../types';
import { Button } from '../../components/ui/Button';

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
  const [review, setReview] = useState<AdminReview | null>(null);

  const [newStatus, setNewStatus] = useState<ClaimAssistanceCase['status']>('under_review');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [clarificationRequest, setClarificationRequest] = useState('');
  const [recordedDecision, setRecordedDecision] = useState<AdminReview['recordedInsurerDecision']>('pending');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!uid || !claimId) return;
    async function load() {
      const c = await dbGetClaimById(uid!, claimId!);
      if (c) {
        setClaim(c);
        setNewStatus(c.status);
        const [vList, pList, rev, ass] = await Promise.all([
          dbGetVehicles(uid!),
          dbGetPolicies(uid!),
          dbGetAdminReview(claimId!),
          c.assessmentId ? dbGetAssessmentById(uid!, c.assessmentId) : Promise.resolve(null)
        ]);
        setVehicle(vList.find((v) => v.id === c.vehicleId) || null);
        setPolicy(pList.find((p) => p.id === c.policyId) || null);
        setAssessment(ass);
        if (rev) {
          setReview(rev);
          setReviewerNotes(rev.reviewerNotes || '');
          setClarificationRequest(rev.requestedCustomerClarification || '');
          if (rev.recordedInsurerDecision) setRecordedDecision(rev.recordedInsurerDecision);
        }
      }
    }
    load();
  }, [uid, claimId]);

  if (!isAdmin) {
    return <div className="p-8 text-center text-xs text-slate-500">Access Restricted</div>;
  }

  const handleSaveReview = async () => {
    if (!claim || !currentUser) return;
    setSaving(true);

    const oldStatus = claim.status;
    const updatedClaim: ClaimAssistanceCase = {
      ...claim,
      status: newStatus,
      updatedAt: Date.now()
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
          comment: reviewerNotes || 'Review status updated'
        }
      ],
      updatedAt: Date.now()
    };

    await dbSaveClaim(claim.uid, updatedClaim);
    await dbSaveAdminReview(reviewObj);
    setClaim(updatedClaim);
    setReview(reviewObj);
    setSaving(false);
    alert('Review notes and status updated successfully.');
  };

  if (!claim) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading Case Details...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <button onClick={() => navigate('/admin')} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-[10px] font-bold text-blue-600 uppercase">Case: {claim.caseReference}</span>
          <h1 className="text-2xl font-extrabold text-slate-900">Review Case Details</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Case Summary & Evidence */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Accident Details</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
              <p><strong>Incident Date:</strong> {claim.incidentDate} {claim.incidentTime}</p>
              <p><strong>Locality:</strong> {claim.location}</p>
              <p><strong>Type:</strong> {claim.typeOfIncident.toUpperCase()}</p>
              <p><strong>Drivable:</strong> {claim.isDrivable ? 'Yes' : 'No (Requires Towing)'}</p>
              <p><strong>FIR Reference:</strong> {claim.policeFirReference || 'None'}</p>
            </div>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <strong>Description:</strong> {claim.description}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Uploaded Evidence ({claim.evidenceList.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {claim.evidenceList.map((e) => (
                <div key={e.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <img src={e.previewBase64} alt={e.caption} className="h-28 w-full object-cover" />
                  <p className="p-1.5 text-[10px] text-slate-600 truncate">{e.caption}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Review Action Form */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Update Review Action</h3>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Update Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
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
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Request Customer Clarification</label>
              <textarea
                rows={2}
                value={clarificationRequest}
                onChange={(e) => setClarificationRequest(e.target.value)}
                placeholder="Details needed from customer..."
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              ></textarea>
            </div>

            <Button onClick={handleSaveReview} isLoading={saving} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              <span>Save Review Action</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
