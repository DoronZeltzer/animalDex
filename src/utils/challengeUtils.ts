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
export function getWeeklyChallenge(region: Region, weekId?: string): ChallengeAnimal {
  const animals = REGION_ANIMALS[region];
  const id = weekId ?? getCurrentWeekId();
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return animals[hash % animals.length];
}

/** Previous week's ID (for missed-challenge detection) */
export function getPreviousWeekId(): string {
  const d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((d.getTime() - startOfYear.getTime()) / 86_400_000);
  const weekNum = Math.floor(dayOfYear / 7) + 1;
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

/** Last N week IDs, most recent first */
export function getLastNWeekIds(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);
    const start = new Date(d.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((d.getTime() - start.getTime()) / 86_400_000);
    const weekNum = Math.floor(dayOfYear / 7) + 1;
    return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
  });
}

/** Approximate Monday date label for a weekId like "2026-W16" */
export function weekIdToLabel(weekId: string): string {
  const [yearStr, wStr] = weekId.split('-W');
  const dayOffset = (parseInt(wStr) - 1) * 7;
  const d = new Date(parseInt(yearStr), 0, 1 + dayOffset);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/** Lerp two hex colours by t ∈ [0,1] */
function lerpHex(from: string, to: string, t: number): string {
  const r1 = parseInt(from.slice(1, 3), 16), g1 = parseInt(from.slice(3, 5), 16), b1 = parseInt(from.slice(5, 7), 16);
  const r2 = parseInt(to.slice(1, 3), 16),   g2 = parseInt(to.slice(3, 5), 16),   b2 = parseInt(to.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * t).toString(16).padStart(2, '0');
  const g = Math.round(g1 + (g2 - g1) * t).toString(16).padStart(2, '0');
  const b = Math.round(b1 + (b2 - b1) * t).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

/** Compute theme colours from a gold level (0–10) */
export function getGoldColors(level: number): { bg: string; card: string; tabBar: string } {
  const t = Math.min(Math.max(level, 0), 10) / 10;
  return {
    bg:      lerpHex('#FAFAF5', '#FFF3C4', t),
    card:    lerpHex('#FFFFFF', '#FFEDAB', t),
    tabBar:  lerpHex('#FFFFFF', '#FFE88A', t),
  };
}

/** True if the scanned animal name matches the challenge (case-insensitive contains) */
export function matchesChallenge(scannedName: string, challengeName: string): boolean {
  const a = scannedName.toLowerCase();
  const b = challengeName.toLowerCase();
  return a.includes(b) || b.includes(a);
}
