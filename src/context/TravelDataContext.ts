import { createContext } from 'react';
import type {
  AddFlightPayload,
  AddHotelPayload,
  AddRentalPayload,
  AddTrainPayload,
  TravelDataState,
} from '../types';

export interface TravelDataContextValue extends TravelDataState {
  addFlight: (flight: AddFlightPayload) => void;
  updateFlight: (id: string, flight: AddFlightPayload) => void;
  toggleFlightSelection: (id: string, selected: boolean) => void;
  removeFlight: (id: string) => void;
  addHotel: (hotel: AddHotelPayload) => void;
  updateHotel: (id: string, hotel: AddHotelPayload) => void;
  toggleHotelSelection: (id: string, selected: boolean) => void;
  removeHotel: (id: string) => void;
  addRental: (rental: AddRentalPayload) => void;
  updateRental: (id: string, rental: AddRentalPayload) => void;
  toggleRentalSelection: (id: string, selected: boolean) => void;
  removeRental: (id: string) => void;
  addTrain: (train: AddTrainPayload) => void;
  updateTrain: (id: string, train: AddTrainPayload) => void;
  toggleTrainSelection: (id: string, selected: boolean) => void;
  removeTrain: (id: string) => void;
  clearAll: () => void;
}

export const TravelDataContext = createContext<TravelDataContextValue | undefined>(undefined);
