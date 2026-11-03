import {
  CLUB_PRACTICED_SPORT_ORDER,
  PRACTICED_SPORT_DRAWING,
  type ClubPracticedSport,
} from '@/lib/club-practiced-sports';
import { DRAWING_DOC_VERSION, type FieldTemplate } from '@/lib/exercise-drawing';

export const COACH_FREE_MAX_EXERCISES = 20;
const SPORT_KEY = 'synq-free-sport';

export type CoachFreeExercise = {
  id: string;
  title: string;
  updatedAt: string;
  drawing: unknown;
};

export type CoachFreePlayer = {
  id: string;
  name: string;
  number: string;
  position: string;
};

export type CoachFreeMatchResult = {
  id: string;
  date: string;
  opponent: string;
  goalsFor: number;
  goalsAgainst: number;
};

function storage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

function readJson<T>(key: string, fallback: T): T {
  const raw = storage()?.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  storage()?.setItem(key, JSON.stringify(value));
}

export function isCoachFreeSport(value: string | null): value is ClubPracticedSport {
  return CLUB_PRACTICED_SPORT_ORDER.includes(value as ClubPracticedSport);
}

export function loadCoachFreeSport(): ClubPracticedSport {
  const saved = storage()?.getItem(SPORT_KEY) ?? null;
  return isCoachFreeSport(saved) ? saved : 'football';
}

export function saveCoachFreeSport(sport: ClubPracticedSport) {
  storage()?.setItem(SPORT_KEY, sport);
}

export function coachFreeBoardReady(sport: ClubPracticedSport): boolean {
  return PRACTICED_SPORT_DRAWING[sport].boardReady;
}

export function blankCoachFreeDrawing(sport: ClubPracticedSport) {
  const field = (PRACTICED_SPORT_DRAWING[sport].defaultField ?? 'football-full') as FieldTemplate;
  return { version: DRAWING_DOC_VERSION, field, elements: [] as unknown[] };
}

function areaKey(sport: ClubPracticedSport, area: string) {
  return `synq-free:${sport}:${area}`;
}

export function loadMatchDrawing(sport: ClubPracticedSport): unknown | null {
  return readJson<unknown | null>(areaKey(sport, 'match'), null);
}

export function saveMatchDrawing(sport: ClubPracticedSport, drawing: unknown) {
  writeJson(areaKey(sport, 'match'), drawing);
}

export function loadExercises(sport: ClubPracticedSport): CoachFreeExercise[] {
  const items = readJson<CoachFreeExercise[]>(areaKey(sport, 'exercises'), []);
  return Array.isArray(items) ? items : [];
}

export function saveExercise(sport: ClubPracticedSport, exercise: CoachFreeExercise): string | null {
  const items = loadExercises(sport);
  const index = items.findIndex((item) => item.id === exercise.id);
  if (index === -1 && items.length >= COACH_FREE_MAX_EXERCISES) {
    return `Has llegado a ${COACH_FREE_MAX_EXERCISES} ejercicios en dos meses.`;
  }
  const next = [...items];
  if (index === -1) next.unshift(exercise);
  else next[index] = exercise;
  writeJson(areaKey(sport, 'exercises'), next);
  return null;
}

export function deleteExercise(sport: ClubPracticedSport, id: string) {
  writeJson(
    areaKey(sport, 'exercises'),
    loadExercises(sport).filter((item) => item.id !== id)
  );
}

export function loadPlayers(sport: ClubPracticedSport): CoachFreePlayer[] {
  const items = readJson<CoachFreePlayer[]>(areaKey(sport, 'players'), []);
  return Array.isArray(items) ? items : [];
}

export function savePlayers(sport: ClubPracticedSport, players: CoachFreePlayer[]) {
  writeJson(areaKey(sport, 'players'), players);
}

export function loadResults(sport: ClubPracticedSport): CoachFreeMatchResult[] {
  const items = readJson<CoachFreeMatchResult[]>(areaKey(sport, 'season'), []);
  return Array.isArray(items) ? items : [];
}

export function saveResults(sport: ClubPracticedSport, results: CoachFreeMatchResult[]) {
  writeJson(areaKey(sport, 'season'), results);
}
