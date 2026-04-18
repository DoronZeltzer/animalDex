import { ChallengeAnimal, REGION_ANIMALS, Region } from '../data/challengeAnimals';

/** ISO week string e.g. "2026-W16" */
export function getCurrentWeekId(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86_400_000);
  const weekNum = Math.floor(dayOfYear / 7) + 1;
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

/** How many days remain until the next Monday (challenge resets weekly) */
export function daysLeftInWeek(): number {
  const now = new Date();
  const day = now.getDay(); // 0=Sun … 6=Sat
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  return daysUntilMonday;
}

/** Pick the same animal for everyone in the same region during the same week */
export function getWeeklyChallenge(region: Region): ChallengeAnimal {
  const animals = REGION_ANIMALS[region];
  const weekId = getCurrentWeekId();
  // Simple but consistent hash: sum char codes of weekId
  const hash = weekId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return animals[hash % animals.length];
}

/** True if the scanned animal name matches the challenge (case-insensitive contains) */
export function matchesChallenge(scannedName: string, challengeName: string): boolean {
  const a = scannedName.toLowerCase();
  const b = challengeName.toLowerCase();
  return a.includes(b) || b.includes(a);
}
