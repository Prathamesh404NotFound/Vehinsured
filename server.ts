import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json({ limit: '25mb' }));

// Shared Gemini AI client setup
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Server-side Gemini AI Damage Assessment Endpoint
app.post('/api/gemini/assess', async (req, res) => {
  if (!ai || !apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === 'YOUR_GEMINI_API_KEY') {
    return res.status(503).json({
      status: 'model_unavailable',
      modelIdentifier: 'Gemini-4-Argon-Vision',
      statusMessage: 'Gemini API Key is not configured on the server. You can complete a manual assessment.',
      regions: [],
    });
  }

  try {
    const { imagesBase64, vehicleDetails } = req.body;

    if (!imagesBase64 || !Array.isArray(imagesBase64) || imagesBase64.length === 0) {
      return res.status(400).json({ error: 'At least one image is required for AI damage assessment.' });
    }

    const imageParts = imagesBase64.map((imgStr: string) => {
      const match = imgStr.match(/^data:(image\/\w+);base64,(.+)$/);
      return {
        inlineData: {
          mimeType: match ? match[1] : 'image/jpeg',
          data: match ? match[2] : imgStr,
        },
      };
    });

    const promptText = `
You are a professional automotive computer vision inspection system. Analyze the attached vehicle accident photograph(s).
Vehicle Context: Make: ${vehicleDetails?.make || 'Unknown'}, Model: ${vehicleDetails?.model || 'Unknown'}, Category: ${vehicleDetails?.category || 'Unknown'}.

Identify each visible damaged component, the type of damage (dent, scratch, crack, broken, alignment), confidence score (0.0 to 1.0), and estimated severity (minor, moderate, severe, unable_to_determine).
Also state if the vehicle appears safe to drive or requires roadside towing.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-argon',
      contents: { parts: [...imageParts, { text: promptText }] },
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summaryAnalysis: { type: Type.STRING, description: 'Overall summary of visible accident damage.' },
            isVehicleDrivableAccordingToAI: { type: Type.BOOLEAN, description: 'Whether the vehicle appears drivable based on visible damage.' },
            regions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  partName: { type: Type.STRING, description: 'Part name like Front Bumper, Headlight Left, Bonnet, Front Door' },
                  damageType: { type: Type.STRING, description: 'dent, scratch, crack, broken, or alignment' },
                  severity: { type: Type.STRING, description: 'minor, moderate, severe, or unable_to_determine' },
                  confidence: { type: Type.NUMBER, description: 'Confidence value between 0.0 and 1.0' },
                  userDescription: { type: Type.STRING }
                },
                required: ['partName', 'damageType', 'severity', 'confidence']
              }
            }
          },
          required: ['summaryAnalysis', 'regions', 'isVehicleDrivableAccordingToAI']
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('Empty response received from Gemini AI model');
    }

    const parsed = JSON.parse(resultText);

    return res.json({
      status: 'completed',
      modelIdentifier: 'Gemini-4-Argon-Vision',
      statusMessage: 'AI damage analysis completed successfully via server-side Gemini 4 Argon.',
      summaryAnalysis: parsed.summaryAnalysis,
      isVehicleDrivableAccordingToAI: parsed.isVehicleDrivableAccordingToAI,
      regions: (parsed.regions || []).map((r: any, idx: number) => ({
        ...r,
        id: r.id || `ai-region-${idx + 1}-${Date.now()}`
      }))
    });

  } catch (err: any) {
    console.error('Gemini API Error:', err);
    return res.status(500).json({
      status: 'failed',
      modelIdentifier: 'Gemini-4-Argon-Vision',
      statusMessage: `AI assessment server error: ${err.message || err}`,
      regions: []
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend Express server listening on port ${PORT}`);
});
