import type { TravelDataState } from '../types';

export interface TravelDataStore {
  load(): TravelDataState | undefined;
  save(state: TravelDataState): void;
  clear(): void;
}

const STORAGE_KEY = 'travelplanner-data-v1';

export class LocalTravelDataStore implements TravelDataStore {
  load(): TravelDataState | undefined {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return undefined;
    }

    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          flights: Array.isArray(parsed.flights) ? parsed.flights : [],
          hotels: Array.isArray(parsed.hotels) ? parsed.hotels : [],
          rentals: Array.isArray(parsed.rentals) ? parsed.rentals : [],
          trains: Array.isArray(parsed.trains) ? parsed.trains : [],
        } satisfies TravelDataState;
      }
    } catch (error) {
      console.error('Failed to parse stored travel data', error);
    }

    return undefined;
  }

  save(state: TravelDataState): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to persist travel data', error);
    }
  }

  clear(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
  }
}
