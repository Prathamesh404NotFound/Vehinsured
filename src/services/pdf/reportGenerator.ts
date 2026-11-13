import jsPDF from 'jspdf';
import {
  ClaimAssistanceCase,
  Vehicle,
  InsurancePolicy,
  DamageAssessment,
  CostEstimateResult,
  AdminReview
} from '../../types';

export interface ReportDataBundle {
  claim: ClaimAssistanceCase;
  vehicle?: Vehicle | null;
  policy?: InsurancePolicy | null;
  assessment?: DamageAssessment | null;
  costEstimate?: CostEstimateResult | null;
  adminReview?: AdminReview | null;
}

export function generateAssessmentPdfReport(bundle: ReportDataBundle): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const { claim, vehicle, policy, assessment, costEstimate, adminReview } = bundle;

  // Primary palette styling
  const primaryNavy = [15, 23, 42]; // #0f172a
  const accentBlue = [37, 99, 235]; // #2563eb
  const textDark = [51, 65, 85];    // #334155
  const lightGrey = [241, 245, 249]; // #f1f5f9

  let y = 15;

  // Header Banner
  doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('AI VEHICLE DAMAGE ASSESSMENT & CLAIM ASSISTANCE REPORT', 12, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Reference No: ${claim.caseReference}  |  Generated: ${new Date().toLocaleString()}`, 12, 20);

  y = 35;

  // Mandatory Disclaimer
  doc.setFillColor(254, 243, 199); // Light amber
  doc.rect(12, y, 186, 12, 'F');
  doc.setTextColor(146, 64, 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(
    'PRELIMINARY ASSESSMENT REPORT — NOT AN OFFICIAL INSURANCE SURVEY, REPAIR QUOTATION, OR APPROVAL GUARANTEE',
    15,
    y + 7
  );

  y += 18;

  // Section 1: Vehicle & Policy Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text('1. Vehicle & Insurance Policy Information', 12, y);
  y += 4;
  doc.setDrawColor(226, 232, 240);
  doc.line(12, y, 198, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);

  doc.text(`Vehicle Reg No: ${vehicle?.displayRegistrationNumber || vehicle?.registrationNumber || 'N/A'}`, 14, y);
  doc.text(`Make & Model: ${vehicle?.make || 'N/A'} ${vehicle?.model || ''}`, 110, y);
  y += 5;
  doc.text(`Category: ${vehicle?.category?.toUpperCase() || 'HATCHBACK'}`, 14, y);
  doc.text(`Manufacturing Year: ${vehicle?.manufacturingYear || 'N/A'}`, 110, y);
  y += 5;
  doc.text(`Insurer: ${policy?.insurerName || 'Not Linked'}`, 14, y);
  doc.text(`Policy No: ${policy?.policyNumber || 'Not Linked'}`, 110, y);
  y += 8;

  // Section 2: Accident Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text('2. Accident Incident Details', 12, y);
  y += 4;
  doc.line(12, y, 198, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`Date & Time: ${claim.incidentDate} at ${claim.incidentTime}`, 14, y);
  doc.text(`Location: ${claim.location}`, 110, y);
  y += 5;
  doc.text(`Incident Type: ${claim.typeOfIncident.replace('_', ' ').toUpperCase()}`, 14, y);
  doc.text(`Vehicle Drivable: ${claim.isDrivable ? 'Yes' : 'No (Roadside inspection advised)'}`, 110, y);
  y += 5;
  doc.text(`FIR / Police Ref: ${claim.policeFirReference || 'None recorded'}`, 14, y);
  y += 5;
  doc.text(`Incident Description: ${claim.description.substring(0, 120)}${claim.description.length > 120 ? '...' : ''}`, 14, y);
  y += 10;

  // Section 3: Damage Assessment Findings
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text('3. Damage Assessment Findings', 12, y);
  y += 4;
  doc.line(12, y, 198, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Assessment Method: ${assessment?.inferenceMethod === 'gemini_vision' ? 'AI Vision (Gemini 4 Argon)' : assessment?.inferenceMethod === 'onnx_local' ? 'Local ONNX Computer Vision' : 'User Manual Observation'}`, 14, y);
  doc.text(`Model Identifier: ${assessment?.modelIdentifier || 'Manual Observation'}`, 110, y);
  y += 7;

  if (assessment?.regions && assessment.regions.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(lightGrey[0], lightGrey[1], lightGrey[2]);
    doc.rect(12, y, 186, 6, 'F');
    doc.text('Part Name', 15, y + 4);
    doc.text('Damage Type', 65, y + 4);
    doc.text('Severity', 115, y + 4);
    doc.text('Confidence / Source', 155, y + 4);
    y += 8;

    doc.setFont('helvetica', 'normal');
    assessment.regions.forEach((region) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.text(region.partName, 15, y);
      doc.text(region.damageType.toUpperCase(), 65, y);
      doc.text(region.severity.toUpperCase(), 115, y);
      doc.text(
        region.confidence !== undefined
          ? `${Math.round(region.confidence * 100)}% (AI)`
          : region.isUserAddedOrCorrected
          ? 'User Corrected'
          : 'Manual',
        155,
        y
      );
      y += 5;
    });
  } else {
    doc.text('No specific damage components recorded.', 14, y);
    y += 5;
  }

  y += 6;

  // Section 4: Cost Estimates
  if (costEstimate) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
    doc.text('4. Indicative Repair Cost Estimates', 12, y);
    y += 4;
    doc.line(12, y, 198, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(`Estimated Range: Rs. ${costEstimate.totalMin.toLocaleString('en-IN')} - Rs. ${costEstimate.totalMax.toLocaleString('en-IN')}`, 14, y);
    y += 5;
    doc.setFontSize(8);
    doc.text(`Based on regional reference table ${costEstimate.referenceTableVersion} (${costEstimate.vehicleCategory.toUpperCase()} vehicle baseline).`, 14, y);
    y += 8;
  }

  // Section 5: Nominee Guidance (If applicable)
  if (claim.isDeceasedCase && claim.nomineeDetails) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(185, 28, 28); // Muted red header
    doc.text('5. Nominee & Legal-Heir Special Guidance', 12, y);
    y += 4;
    doc.line(12, y, 198, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(`Deceased Policyholder: ${claim.nomineeDetails.policyholderName}`, 14, y);
    doc.text(`Applicant Relationship: ${claim.nomineeDetails.relationshipToPolicyholder}`, 110, y);
    y += 5;
    doc.text('Required Checklist: Death Certificate, Relationship Proof, Insurer Nominee Claim Form, Bank Mandate.', 14, y);
    y += 8;
  }

  // Footer Disclaimer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'This report is generated locally by the AI-Based Vehicle Damage Assessment application for academic engineering evaluation. All estimates are indicative.',
    12,
    285
  );

  return doc;
}

export function exportBundleAsJson(bundle: ReportDataBundle): string {
  return JSON.stringify(bundle, null, 2);
}
