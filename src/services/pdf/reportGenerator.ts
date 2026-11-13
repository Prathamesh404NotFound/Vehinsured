import { jsPDF } from 'jspdf';
import {
  ClaimAssistanceCase,
  Vehicle,
  InsurancePolicy,
  DamageAssessment,
  CostEstimateResult,
  AdminReview,
  DocumentItem,
} from '../../types';

export interface ReportDataBundle {
  claim: ClaimAssistanceCase;
  vehicle?: Vehicle | null;
  policy?: InsurancePolicy | null;
  assessment?: DamageAssessment | null;
  costEstimate?: CostEstimateResult | null;
  adminReview?: AdminReview | null;
  confirmedDocuments?: DocumentItem[];
}

/**
 * Standard jsPDF built-in Helvetica only supports Latin-1 glyphs.
 * If Devanagari characters exist in user notes, note them safely without corrupting glyphs.
 */
function sanitizePdfText(text?: string): string {
  if (!text) return '';
  const hasNonLatin = /[^\u0000-\u00FF]/.test(text);
  if (!hasNonLatin) return text;
  const asciiOnly = text.replace(/[^\u0020-\u007E]/g, '').trim();
  return asciiOnly
    ? `${asciiOnly} [Note: Non-Latin script preserved in JSON/Print view]`
    : '[Devanagari/Unicode text recorded — view in browser Print View or JSON export for exact script rendering]';
}

export function generateAssessmentPdfReport(bundle: ReportDataBundle): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const { claim, vehicle, policy, assessment, costEstimate, adminReview, confirmedDocuments } = bundle;

  const primaryNavy: [number, number, number] = [15, 23, 42];
  const textDark: [number, number, number] = [51, 65, 85];
  const lightGrey: [number, number, number] = [241, 245, 249];

  let y = 15;

  const ensureSpace = (neededMm: number) => {
    if (y + neededMm > 272) {
      doc.addPage();
      y = 18;
    }
  };

  // Header Banner
  doc.setFillColor(...primaryNavy);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('PRELIMINARY VEHICLE DAMAGE & CLAIM ASSISTANCE REPORT', 12, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(
    `Case Ref: ${claim.caseReference}  |  Generated: ${new Date().toLocaleString()}  |  Status: ${claim.status.replace(/_/g, ' ').toUpperCase()}`,
    12,
    20
  );

  y = 34;

  // Mandatory Disclaimer Box
  doc.setFillColor(254, 243, 199);
  doc.rect(12, y, 186, 13, 'F');
  doc.setTextColor(146, 64, 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(
    'Preliminary assessment and claim-assistance report. Not an official insurance survey, repair quotation, or guarantee of claim approval.',
    14,
    y + 8,
    { maxWidth: 182 }
  );

  y += 19;

  // Section 1: Vehicle & Policy Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...primaryNavy);
  doc.text('1. Vehicle & Insurance Policy Details', 12, y);
  y += 3;
  doc.setDrawColor(203, 213, 225);
  doc.line(12, y, 198, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...textDark);

  doc.text(`Registration: ${vehicle?.displayRegistrationNumber || vehicle?.registrationNumber || 'N/A'}`, 14, y);
  doc.text(`Make & Model: ${sanitizePdfText(vehicle?.make)} ${sanitizePdfText(vehicle?.model)}`, 108, y);
  y += 5;
  doc.text(`Category: ${vehicle?.category?.toUpperCase() || 'HATCHBACK'}`, 14, y);
  doc.text(`Year: ${vehicle?.manufacturingYear || 'N/A'}`, 108, y);
  y += 5;
  doc.text(`Insurer: ${sanitizePdfText(policy?.insurerName) || 'Not Linked'}`, 14, y);
  doc.text(`Policy No: ${sanitizePdfText(policy?.policyNumber) || 'Not Linked'}`, 108, y);
  y += 5;
  doc.text(
    `Policy Source: ${policy?.isVerifiedByAdmin ? 'Reviewer Checked' : policy?.isExtractedByOcr ? 'OCR Prefilled (User Confirmed)' : 'User Entered'}`,
    14,
    y
  );
  y += 9;

  // Section 2: Accident Incident Summary
  ensureSpace(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...primaryNavy);
  doc.text('2. Accident Incident Summary', 12, y);
  y += 3;
  doc.line(12, y, 198, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...textDark);
  doc.text(`Date & Time: ${claim.incidentDate} ${claim.incidentTime}`, 14, y);
  doc.text(`Drivable (User Reported): ${claim.isDrivable ? 'Yes' : 'No (Inspection advised)'}`, 108, y);
  y += 5;
  doc.text(`Location: ${sanitizePdfText(claim.location) || 'Not specified'}`, 14, y);
  doc.text(`Incident Type: ${claim.typeOfIncident.replace(/_/g, ' ').toUpperCase()}`, 108, y);
  y += 5;
  doc.text(`Other Vehicle Involved: ${claim.otherVehicleInvolved ? 'Yes' : 'No'}`, 14, y);
  doc.text(`Police FIR Ref: ${sanitizePdfText(claim.policeFirReference) || 'None recorded'}`, 108, y);
  y += 6;

  const descLines = doc.splitTextToSize(`Description: ${sanitizePdfText(claim.description) || 'None provided'}`, 182);
  ensureSpace(descLines.length * 4.5 + 4);
  doc.text(descLines, 14, y);
  y += descLines.length * 4.5 + 6;

  // Section 3: Damage Assessment Findings
  ensureSpace(28);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...primaryNavy);
  doc.text('3. Damage Assessment Findings', 12, y);
  y += 3;
  doc.line(12, y, 198, y);
  y += 6;

  const sourceLabel =
    assessment?.inferenceMethod === 'gemini_vision'
      ? 'AI Vision (Gemini 4 Argon)'
      : assessment?.inferenceMethod === 'onnx_local'
      ? 'Local ONNX Computer Vision'
      : assessment?.inferenceMethod === 'illustrative_demo'
      ? 'Example assessment — illustrative data, not generated by the AI model'
      : 'User Manual Observation';

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Source Method: ${sourceLabel}`, 14, y);
  y += 6;

  if (assessment?.regions && assessment.regions.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(...lightGrey);
    doc.rect(12, y, 186, 6, 'F');
    doc.text('Component', 14, y + 4);
    doc.text('Damage Type', 64, y + 4);
    doc.text('Severity', 105, y + 4);
    doc.text('Origin / Confidence', 145, y + 4);
    y += 8;

    doc.setFont('helvetica', 'normal');
    assessment.regions.forEach((region) => {
      ensureSpace(7);
      doc.text(sanitizePdfText(region.partName), 14, y);
      doc.text(region.damageType.toUpperCase(), 64, y);
      doc.text(region.severity.replace(/_/g, ' ').toUpperCase(), 105, y);
      const originText = region.isIllustrativeDemo
        ? 'Illustrative Demo'
        : region.confidence !== undefined
        ? `${Math.round(region.confidence * 100)}% (AI)`
        : 'User Reported';
      doc.text(originText, 145, y);
      y += 5.5;
    });
  } else {
    doc.text('No damaged components recorded.', 14, y);
    y += 6;
  }

  y += 5;

  // Section 4: Evidence Thumbnails
  if (claim.evidenceList && claim.evidenceList.length > 0) {
    ensureSpace(45);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...primaryNavy);
    doc.text(`4. Uploaded Evidence Photographs (${claim.evidenceList.length})`, 12, y);
    y += 3;
    doc.line(12, y, 198, y);
    y += 6;

    let x = 14;
    for (let i = 0; i < claim.evidenceList.length; i++) {
      const ev = claim.evidenceList[i];
      if (x > 150) {
        x = 14;
        y += 36;
      }
      ensureSpace(36);
      try {
        if (ev.previewBase64 && ev.previewBase64.startsWith('data:image/')) {
          doc.addImage(ev.previewBase64, 'JPEG', x, y, 42, 28);
        }
      } catch {
        doc.rect(x, y, 42, 28);
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(sanitizePdfText(ev.caption).slice(0, 28), x, y + 32);
      x += 46;
    }
    y += 40;
  }

  // Section 5: Cost Estimate
  if (costEstimate) {
    ensureSpace(32);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...primaryNavy);
    doc.text('5. Indicative Repair Cost Range', 12, y);
    y += 3;
    doc.line(12, y, 198, y);
    y += 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...textDark);
    doc.text(
      `Estimated Range: Rs. ${costEstimate.totalMin.toLocaleString('en-IN')} - Rs. ${costEstimate.totalMax.toLocaleString('en-IN')}`,
      14,
      y
    );
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const discLines = doc.splitTextToSize(costEstimate.disclaimer, 182);
    doc.text(discLines, 14, y);
    y += discLines.length * 4 + 5;
  }

  // Section 6: Confirmed OCR Documents
  if (confirmedDocuments && confirmedDocuments.length > 0) {
    ensureSpace(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...primaryNavy);
    doc.text('6. User-Confirmed Document Scans', 12, y);
    y += 3;
    doc.line(12, y, 198, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    confirmedDocuments.forEach((d) => {
      ensureSpace(6);
      const summary = Object.entries(d.extractedFields)
        .filter(([, v]) => Boolean(v))
        .map(([k, v]) => `${k}: ${sanitizePdfText(v)}`)
        .join(' | ');
      const lines = doc.splitTextToSize(`${d.category.toUpperCase()}: ${summary}`, 182);
      doc.text(lines, 14, y);
      y += lines.length * 4 + 2;
    });
    y += 4;
  }

  // Section 7: Nominee / Deceased Policyholder Guidance
  if (claim.isDeceasedCase && claim.nomineeDetails) {
    ensureSpace(28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(185, 28, 28);
    doc.text('7. Nominee & Legal-Heir Claim Guidance', 12, y);
    y += 3;
    doc.line(12, y, 198, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...textDark);
    doc.text(`Policyholder: ${sanitizePdfText(claim.nomineeDetails.policyholderName)}`, 14, y);
    doc.text(`Applicant: ${sanitizePdfText(claim.nomineeDetails.applicantName)} (${claim.nomineeDetails.relationshipToPolicyholder})`, 105, y);
    y += 5;
    doc.text(
      'Checklist: Death Certificate, Relationship/Succession Proof, RC, Policy, NEFT Mandate. Confirm exact procedure with insurer.',
      14,
      y,
      { maxWidth: 182 }
    );
    y += 8;
  }

  // Section 8: Internal Reviewer Notes
  if (adminReview) {
    ensureSpace(22);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...primaryNavy);
    doc.text('8. Internal Application Review Status', 12, y);
    y += 3;
    doc.line(12, y, 198, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Reviewer Status: ${adminReview.status.replace(/_/g, ' ').toUpperCase()}`, 14, y);
    y += 5;
    if (adminReview.reviewerNotes) {
      const noteLines = doc.splitTextToSize(`Reviewer Comment: ${sanitizePdfText(adminReview.reviewerNotes)}`, 182);
      doc.text(noteLines, 14, y);
      y += noteLines.length * 4 + 4;
    }
  }

  // Page numbers & footer on every page
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Preliminary report — Not an official insurer survey or approval | Page ${p} of ${pageCount}`,
      12,
      287
    );
  }

  return doc;
}

export function exportBundleAsJson(bundle: ReportDataBundle): string {
  return JSON.stringify(bundle, null, 2);
}
