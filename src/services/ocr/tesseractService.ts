import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { DocumentItem } from '../../types';

// Configure PDF.js worker using bundled module URL
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
} catch {
  // Fallback if environment blocks module URL resolution
}

export interface OCRProcessResult {
  rawText: string;
  extractedFields: Record<string, string>;
  confidenceScore: number;
  ocrError?: string;
}

async function renderPdfFirstPageToDataUrl(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1.75 });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable for PDF rendering.');

  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  return canvas.toDataURL('image/png');
}

export async function runBrowserOCR(
  fileOrSource: File | Blob | string,
  category: DocumentItem['category'],
  onProgress?: (progress: number, status: string) => void
): Promise<OCRProcessResult> {
  let worker: Awaited<ReturnType<typeof createWorker>> | undefined;
  try {
    let ocrTarget: File | Blob | string = fileOrSource;

    if (fileOrSource instanceof File && fileOrSource.type === 'application/pdf') {
      if (onProgress) onProgress(5, 'Rendering PDF page 1 in browser...');
      ocrTarget = await renderPdfFirstPageToDataUrl(fileOrSource);
    }

    if (onProgress) onProgress(15, 'Initializing local Tesseract OCR engine...');
    worker = await createWorker('eng');

    if (onProgress) onProgress(40, 'Scanning document text locally...');
    const ret = await worker.recognize(ocrTarget);
    const text = ret.data.text || '';
    const confidence = ret.data.confidence || 0;

    if (onProgress) onProgress(85, 'Extracting structured fields...');
    const extractedFields = parseStructuredFields(text, category);

    if (onProgress) onProgress(100, 'OCR processing complete.');
    await worker.terminate();

    return {
      rawText: text,
      extractedFields,
      confidenceScore: Math.round(confidence),
    };
  } catch (err: any) {
    if (worker) {
      await worker.terminate().catch(() => {});
    }
    console.warn('OCR processing failed:', err);
    return {
      rawText: '',
      extractedFields: getFallbackFieldsForCategory(category),
      confidenceScore: 0,
      ocrError:
        err?.message ||
        'OCR failed or document could not be read cleanly. Please enter or verify fields manually.',
    };
  }
}

function parseStructuredFields(text: string, category: DocumentItem['category']): Record<string, string> {
  const fields: Record<string, string> = {};

  const regNoMatch = text.match(/\b([A-Z]{2}[\s-]?[0-9]{2}[\s-]?[A-Z]{1,2}[\s-]?[0-9]{4})\b/i);
  if (regNoMatch) fields['registrationNumber'] = regNoMatch[1].replace(/[\s-]/g, '').toUpperCase();

  const policyMatch =
    text.match(/\b(?:POL|INS|POLICY)[\s:-]*([A-Z0-9\/-]{8,22})\b/i) ||
    text.match(/\b([0-9]{4}\/[0-9]{6,10}\/[0-9]{2}\/[0-9]{3})\b/);
  if (policyMatch) fields['policyNumber'] = policyMatch[1];

  const dateMatches = text.match(/\b(\d{2}[\/.-]\d{2}[\/.-]\d{4})\b/g);
  if (dateMatches && dateMatches.length > 0) {
    fields['date'] = dateMatches[0];
    if (dateMatches.length > 1) fields['expiryDate'] = dateMatches[1];
  }

  if (category === 'rc') {
    fields['documentType'] = 'Vehicle Registration Certificate (RC)';
    if (!fields['registrationNumber']) {
      fields['registrationNumber'] = extractPattern(text, ['REG NO', 'REGN NO', 'REGISTRATION']) || '';
    }
    fields['ownerName'] = extractPattern(text, ['OWNER NAME', 'NAME', 'S/W/D']) || '';
    fields['makeModel'] = extractPattern(text, ['MAKER', 'MODEL', 'MFR']) || '';
  } else if (category === 'insurance_policy') {
    fields['documentType'] = 'Insurance Policy Schedule';
    fields['insurerName'] =
      extractPattern(text, ['ICICI', 'HDFC', 'BAJAJ', 'TATA AIG', 'NEW INDIA', 'INSURANCE']) || '';
    if (!fields['policyNumber']) fields['policyNumber'] = extractPattern(text, ['POLICY NO', 'SCHEDULE NO']) || '';
    fields['policyholderName'] = extractPattern(text, ['INSURED NAME', 'POLICYHOLDER', 'NAME']) || '';
    if (!fields['expiryDate']) fields['expiryDate'] = fields['date'] || '';
  } else if (category === 'driving_licence') {
    fields['documentType'] = 'Driving Licence (DL)';
    fields['licenceNumber'] = extractPattern(text, ['DL NO', 'LICENCE NO', 'DL']) || '';
    fields['holderName'] = extractPattern(text, ['NAME']) || '';
  } else if (category === 'death_certificate') {
    fields['documentType'] = 'Death Certificate';
    fields['deceasedName'] = extractPattern(text, ['NAME OF DECEASED', 'DECEASED', 'NAME']) || '';
    fields['dateOfDeath'] = fields['date'] || '';
  } else if (category === 'fir') {
    fields['documentType'] = 'Police FIR / Accident Entry';
    fields['firNumber'] = extractPattern(text, ['FIR NO', 'CRIME NO', 'GD NO']) || '';
    fields['policeStation'] = extractPattern(text, ['POLICE STATION', 'P.S.']) || '';
  } else {
    fields['documentType'] = 'Supporting Document';
    fields['referenceNumber'] = extractPattern(text, ['REF NO', 'INVOICE NO', 'ESTIMATE NO']) || '';
  }

  return fields;
}

function extractPattern(text: string, keywords: string[]): string {
  const lines = text.split('\n');
  for (const line of lines) {
    for (const kw of keywords) {
      if (line.toUpperCase().includes(kw)) {
        const cleaned = line.replace(new RegExp(kw, 'gi'), '').replace(/[:\-_=]/g, '').trim();
        if (cleaned.length > 2) return cleaned.slice(0, 60);
      }
    }
  }
  return '';
}

function getFallbackFieldsForCategory(category: DocumentItem['category']): Record<string, string> {
  switch (category) {
    case 'rc':
      return { documentType: 'Vehicle RC', registrationNumber: '', ownerName: '', makeModel: '' };
    case 'insurance_policy':
      return { documentType: 'Insurance Policy', insurerName: '', policyNumber: '', policyholderName: '', expiryDate: '' };
    case 'driving_licence':
      return { documentType: 'Driving Licence', licenceNumber: '', holderName: '' };
    case 'death_certificate':
      return { documentType: 'Death Certificate', deceasedName: '', dateOfDeath: '' };
    case 'fir':
      return { documentType: 'Police FIR', firNumber: '', policeStation: '' };
    default:
      return { documentType: 'Supporting Document', referenceNumber: '' };
  }
}
