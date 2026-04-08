export type AnimalCategory = 'land' | 'sea' | 'air';

export interface AnimalIdentification {
  isAnimal: boolean;
  commonName: string;
  scientificName: string;
  category: AnimalCategory;
  subcategory: string;
  breed?: string;
  lifespan: string;
  averageSize: string;
  weight: string;
  history: string;
  funFact: string;
  confidence: number;
}

export interface CollectedAnimal {
  animalId: string;
  commonName: string;
  scientificName: string;
  category: AnimalCategory;
  subcategory: string;
  breed?: string;
  photoURL: string;
  thumbnailURL: string;
  lifespan: string;
  averageSize: string;
  weight: string;
  history: string;
  funFact: string;
  capturedAt: any; // Firestore Timestamp
  claudeConfidence: number;
  isFirstCapture: boolean;
}
