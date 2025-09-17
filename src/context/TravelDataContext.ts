import { createContext } from 'react';
import type {
  AddFlightPayload,
  AddHotelPayload,
  AddRentalPayload,
  TravelDataState,
} from '../types';

export interface TravelDataContextValue extends TravelDataState {
  addFlight: (flight: AddFlightPayload) => void;
  toggleFlightSelection: (id: string, selected: boolean) => void;
  removeFlight: (id: string) => void;
  addHotel: (hotel: AddHotelPayload) => void;
  toggleHotelSelection: (id: string, selected: boolean) => void;
  removeHotel: (id: string) => void;
  addRental: (rental: AddRentalPayload) => void;
  toggleRentalSelection: (id: string, selected: boolean) => void;
  removeRental: (id: string) => void;
  clearAll: () => void;
}

export const TravelDataContext = createContext<TravelDataContextValue | undefined>(undefined);
