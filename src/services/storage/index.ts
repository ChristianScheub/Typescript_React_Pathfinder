import type { IStorageService } from './IStorageService';
import { storageImpl } from './logic/storageImpl';

export const storageService: IStorageService = storageImpl;
export type { ScoreboardData, KastnerBalance } from './IStorageService';
