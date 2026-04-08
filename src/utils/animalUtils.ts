import { AnimalCategory } from '../types/animal';

const SUBCATEGORY_MAP: Record<string, { category: AnimalCategory; subcategory: string }> = {
  // Land - Dogs
  dog: { category: 'land', subcategory: 'dogs' },
  'golden retriever': { category: 'land', subcategory: 'dogs' },
  labrador: { category: 'land', subcategory: 'dogs' },
  poodle: { category: 'land', subcategory: 'dogs' },
  bulldog: { category: 'land', subcategory: 'dogs' },
  // Land - Cats
  cat: { category: 'land', subcategory: 'cats' },
  kitten: { category: 'land', subcategory: 'cats' },
  // Land - Wild
  lion: { category: 'land', subcategory: 'lions' },
  tiger: { category: 'land', subcategory: 'tigers' },
  elephant: { category: 'land', subcategory: 'elephants' },
  bear: { category: 'land', subcategory: 'bears' },
  fox: { category: 'land', subcategory: 'foxes' },
  deer: { category: 'land', subcategory: 'deer' },
  horse: { category: 'land', subcategory: 'horses' },
  cow: { category: 'land', subcategory: 'cattle' },
  // Reptiles
  snake: { category: 'land', subcategory: 'reptiles' },
  lizard: { category: 'land', subcategory: 'reptiles' },
  gecko: { category: 'land', subcategory: 'reptiles' },
  chameleon: { category: 'land', subcategory: 'reptiles' },
  // Sea
  fish: { category: 'sea', subcategory: 'fish' },
  shark: { category: 'sea', subcategory: 'sharks' },
  dolphin: { category: 'sea', subcategory: 'dolphins' },
  whale: { category: 'sea', subcategory: 'whales' },
  turtle: { category: 'sea', subcategory: 'turtles' },
  crab: { category: 'sea', subcategory: 'crabs' },
  jellyfish: { category: 'sea', subcategory: 'jellyfish' },
  octopus: { category: 'sea', subcategory: 'octopus' },
  // Air
  eagle: { category: 'air', subcategory: 'eagles' },
  owl: { category: 'air', subcategory: 'owls' },
  parrot: { category: 'air', subcategory: 'parrots' },
  pigeon: { category: 'air', subcategory: 'pigeons' },
  duck: { category: 'air', subcategory: 'ducks' },
  penguin: { category: 'air', subcategory: 'penguins' },
  bat: { category: 'air', subcategory: 'bats' },
  butterfly: { category: 'air', subcategory: 'butterflies' },
  hawk: { category: 'air', subcategory: 'eagles' },
  falcon: { category: 'air', subcategory: 'eagles' },
};

export function mapToCategory(commonName: string): { category: AnimalCategory; subcategory: string } {
  const lower = commonName.toLowerCase();
  for (const [key, value] of Object.entries(SUBCATEGORY_MAP)) {
    if (lower.includes(key)) return value;
  }
  return { category: 'land', subcategory: 'other land' };
}

export function getCategoryEmoji(category: AnimalCategory): string {
  switch (category) {
    case 'land': return '🌿';
    case 'sea': return '🌊';
    case 'air': return '🌬️';
  }
}

export function getCategoryLabel(category: AnimalCategory): string {
  switch (category) {
    case 'land': return 'Land Animal';
    case 'sea': return 'Sea Animal';
    case 'air': return 'Air Animal';
  }
}
