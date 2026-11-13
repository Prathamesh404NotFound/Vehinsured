import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '25mb' }));

// Shared Gemini AI client setup
const apiKey = process.env.GEMINI_API_KEY;
const ai =
  apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey !== 'YOUR_GEMINI_API_KEY'
    ? new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    geminiConfigured: Boolean(ai),
    timestamp: Date.now(),
  });
});

// Free online vehicle model lookup via US NHTSA vPIC public API (no API key needed)
app.get('/api/vehicles/models/:make', async (req, res) => {
  const make = (req.params.make || '').trim();
  if (!make || !/^[a-zA-Z0-9\s-]{2,40}$/.test(make)) {
    return res.status(400).json({ error: 'Invalid vehicle make parameter.' });
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const apiUrl = `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodeURIComponent(make)}?format=json`;
    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`NHTSA vPIC HTTP ${response.status}`);
    }

    const data = (await response.json()) as { Results?: Array<{ Model_Name?: string }> };
    const models = Array.from(
      new Set((data.Results || []).map((r) => (r.Model_Name || '').trim()).filter(Boolean))
    ).slice(0, 40);

    return res.json({ source: 'NHTSA vPIC Open Data API', make, models });
  } catch (err: any) {
    return res.status(502).json({
      source: 'unavailable',
      error: err?.message || 'Online vehicle catalog temporarily unavailable.',
      models: [],
    });
  }
});

// Server-side Gemini AI Damage Assessment Endpoint
app.post('/api/gemini/assess', async (req, res) => {
  if (!ai) {
    return res.status(503).json({
      status: 'model_unavailable',
      modelIdentifier: 'Gemini-4-Argon-Vision',
      statusMessage:
        'Server-side Gemini API key is not configured. You can use local ONNX inference (if installed) or complete a manual assessment.',
      regions: [],
    });
  }

  try {
    const { imagesBase64, vehicleDetails } = req.body;

    if (!imagesBase64 || !Array.isArray(imagesBase64) || imagesBase64.length === 0) {
      return res.status(400).json({ error: 'At least one image is required for AI damage assessment.' });
    }

    const imageParts = imagesBase64.slice(0, 6).map((imgStr: string) => {
      const match = imgStr.match(/^data:(image\/\w+);base64,(.+)$/);
      return {
        inlineData: {
          mimeType: match ? match[1] : 'image/jpeg',
          data: match ? match[2] : imgStr,
        },
      };
    });

    const promptText = `
You are an automotive computer vision damage inspection assistant. Analyze the attached vehicle photograph(s) objectively.
Vehicle Context: Make: ${vehicleDetails?.make || 'Unknown'}, Model: ${vehicleDetails?.model || 'Unknown'}, Category: ${vehicleDetails?.category || 'Unknown'}.

Identify only genuinely visible exterior damage. For each damaged area, provide:
- partName (e.g., Front Bumper, Rear Bumper, Bonnet, Front Door, Rear Door, Fender, Headlight, Tail Light, Windscreen, Side Mirror)
- damageType (one of: dent, scratch, crack, broken, alignment, other)
- severity (one of: minor, moderate, severe, unable_to_determine)
- confidence (0.0 to 1.0)
- userDescription (concise visual observation)

Also provide an overall summaryAnalysis and whether the vehicle appears drivable based solely on visible exterior damage (note hidden structural damage cannot be ruled out from photos).
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
            isVehicleDrivableAccordingToAI: {
              type: Type.BOOLEAN,
              description: 'Whether the vehicle appears drivable based on visible damage.',
            },
            regions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  partName: { type: Type.STRING },
                  damageType: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                  userDescription: { type: Type.STRING },
                },
                required: ['partName', 'damageType', 'severity', 'confidence'],
              },
            },
          },
          required: ['summaryAnalysis', 'regions', 'isVehicleDrivableAccordingToAI'],
        },
      },
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
        id: r.id || `ai-region-${idx + 1}-${Date.now()}`,
      })),
    });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    return res.status(500).json({
      status: 'failed',
      modelIdentifier: 'Gemini-4-Argon-Vision',
      statusMessage: `AI assessment server error: ${err?.message || 'Unknown error'}`,
      regions: [],
    });
  }
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer();
