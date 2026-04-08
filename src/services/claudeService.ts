import axios from 'axios';
import { AnimalIdentification } from '../types/animal';
import { mapToCategory } from '../utils/animalUtils';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';

const SYSTEM_PROMPT = `You are an expert wildlife biologist and animal identifier. When given an image, identify the animal and respond with ONLY a valid JSON object — no markdown, no explanation, just raw JSON.

If the image does NOT contain an animal, return: {"isAnimal": false}

If it DOES contain an animal, return this exact structure:
{
  "isAnimal": true,
  "commonName": "string",
  "scientificName": "string",
  "category": "land" | "sea" | "air",
  "subcategory": "string (e.g. dogs, fish, eagles)",
  "breed": "string or null",
  "lifespan": "string (e.g. 10-13 years)",
  "averageSize": "string (e.g. 60-90 cm)",
  "weight": "string (e.g. 20-30 kg)",
  "history": "2-3 sentences about the animal's origin, habitat, and behavior.",
  "funFact": "One interesting fun fact about this animal.",
  "confidence": 0.0-1.0
}`;

export async function identifyAnimal(
  base64Image: string,
  apiKey: string
): Promise<AnimalIdentification> {
  const response = await axios.post(
    ANTHROPIC_API_URL,
    {
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: 'Please identify the animal in this image and return the JSON response.',
            },
          ],
        },
      ],
    },
    {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
    }
  );

  const text: string = response.data.content[0].text.trim();
  const parsed = JSON.parse(text);

  if (!parsed.isAnimal) {
    return { isAnimal: false } as AnimalIdentification;
  }

  // Fill in category/subcategory from our taxonomy if Claude's response needs normalization
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
