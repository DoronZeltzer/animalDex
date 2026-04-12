import axios from 'axios';
import { AnimalIdentification } from '../types/animal';
import { mapToCategory } from '../utils/animalUtils';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const PROMPT = `You are an expert wildlife biologist. Look at this image and identify the animal. Respond with ONLY a valid JSON object — no markdown, no explanation, just raw JSON.

If the image does NOT contain an animal, return: {"isAnimal": false}

If it DOES contain an animal, return this exact structure:
{
  "isAnimal": true,
  "commonName": "string",
  "scientificName": "string",
  "category": "land" or "sea" or "air",
  "subcategory": "string (e.g. dogs, fish, eagles)",
  "breed": "string or null",
  "lifespan": "string (e.g. 10-13 years)",
  "averageSize": "string (e.g. 60-90 cm)",
  "weight": "string (e.g. 20-30 kg)",
  "history": "2-3 sentences about the animal's origin, habitat, and behavior.",
  "funFact": "One interesting fun fact about this animal.",
  "confidence": 0.0 to 1.0
}`;

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
        maxOutputTokens: 1024,
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const text: string = response.data.candidates[0].content.parts[0].text.trim();

  // Strip markdown code fences if present
  const clean = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  const parsed = JSON.parse(clean);

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
