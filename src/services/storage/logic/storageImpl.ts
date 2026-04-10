import type { IStorageService, ScoreboardData } from '../IStorageService';

const STORAGE_KEY = 'scoreboard';

export const storageImpl: IStorageService = {
  getScoreboard(): ScoreboardData | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ScoreboardData;
    } catch {
      return null;
    }
  },

  saveScoreboard(data: ScoreboardData): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  hasCompletedOnboarding(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
  },
};
