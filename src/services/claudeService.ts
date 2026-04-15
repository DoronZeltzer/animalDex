import axios from 'axios';
import { AnimalIdentification } from '../types/animal';
import { mapToCategory } from '../utils/animalUtils';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

const PROMPT = `You are an expert wildlife biologist. Identify the animal in this image.

CRITICAL: Your entire response must be a single raw JSON object. No markdown, no code fences, no explanation text before or after. Start your response with { and end with }.

If no animal is visible: {"isAnimal":false}

If an animal is visible:
{"isAnimal":true,"commonName":"...","scientificName":"...","category":"land","subcategory":"dogs","breed":null,"lifespan":"10-13 years","averageSize":"60-90 cm","weight":"20-30 kg","history":"2-3 sentences about origin, habitat, behavior.","funFact":"One fun fact.","confidence":0.9}

category must be exactly one of: land, sea, air
breed should be null if unknown or not applicable`;

export async function identifyAnimal(
  base64Image: string,
  apiKey: string
): Promise<AnimalIdentification> {
  const response = await axios.post(
    `${GEMINI_API_URL}?key=${apiKey}`,
    {
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Image,
              },
            },
            {
              text: PROMPT,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const candidate = response.data.candidates?.[0];
  if (!candidate || candidate.finishReason === 'SAFETY') {
    return { isAnimal: false } as AnimalIdentification;
  }

  const text: string = candidate.content?.parts?.[0]?.text?.trim() ?? '';
  if (!text) throw new Error('Empty response from Gemini.');

  // Aggressively clean and extract JSON
  let clean = text
    .replace(/```json\s*/gi, '')   // strip ```json
    .replace(/```\s*/gi, '')        // strip ```
    .trim();

  // Find the outermost { ... } block
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    clean = clean.slice(start, end + 1);
  }

  let parsed: any;
  try {
    parsed = JSON.parse(clean);
  } catch {
    // Last resort: try to fix common issues (trailing commas, single quotes)
    try {
      const fixed = clean
        .replace(/,\s*([}\]])/g, '$1')   // remove trailing commas
        .replace(/'/g, '"');              // replace single quotes
      parsed = JSON.parse(fixed);
    } catch {
      throw new Error(`Could not parse response: ${text.slice(0, 120)}`);
    }
  }

  if (!parsed.isAnimal) {
    return { isAnimal: false } as AnimalIdentification;
  }

  const { category, subcategory } = mapToCategory(parsed.commonName);

  return {
    isAnimal: true,
    commonName: parsed.commonName ?? 'Unknown Animal',
    scientificName: parsed.scientificName ?? '',
    category: parsed.category ?? category,
    subcategory: parsed.subcategory ?? subcategory,
    breed: parsed.breed ?? undefined,
    lifespan: parsed.lifespan ?? 'Unknown',
    averageSize: parsed.averageSize ?? 'Unknown',
    weight: parsed.weight ?? 'Unknown',
    history: parsed.history ?? '',
    funFact: parsed.funFact ?? '',
    confidence: parsed.confidence ?? 0.8,
  };
}
