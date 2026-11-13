import { DamagedRegion, DamageSeverity } from '../../types';

export interface GeminiAssessmentResult {
  status: 'completed' | 'model_unavailable' | 'failed';
  modelIdentifier: string;
  statusMessage: string;
  regions: DamagedRegion[];
  summaryAnalysis?: string;
  isVehicleDrivableAccordingToAI?: boolean;
}

export async function requestGeminiDamageAssessment(
  imagesBase64: string[],
  vehicleDetails?: { make?: string; model?: string; category?: string }
): Promise<GeminiAssessmentResult> {
  try {
    const res = await fetch('/api/gemini/assess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imagesBase64,
        vehicleDetails,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        status: 'model_unavailable',
        modelIdentifier: 'Gemini-4-Argon-Vision',
        statusMessage: errData.error || 'Server-side Gemini AI vision model unavailable or key not configured. Please use manual assessment mode.',
        regions: [],
      };
    }

    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      status: 'failed',
      modelIdentifier: 'Gemini-4-Argon-Vision',
      statusMessage: `Network or API communication error: ${err.message || err}`,
      regions: [],
    };
  }
}
