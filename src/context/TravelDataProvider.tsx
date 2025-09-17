import { type ReactNode, useEffect, useMemo, useReducer } from 'react';
import type {
  AddFlightPayload,
  AddHotelPayload,
  AddRentalPayload,
  AddTrainPayload,
  FlightOption,
  HotelOption,
  RentalCarOption,
  TrainOption,
  TravelDataState,
} from '../types';
import { LocalTravelDataStore } from '../services/storage';
import type { TravelDataStore } from '../services/storage';
import { TravelDataContext } from './TravelDataContext';
import type { TravelDataContextValue } from './TravelDataContext';

type TravelDataAction =
  | { type: 'hydrate'; payload: TravelDataState }
  | { type: 'addFlight'; payload: AddFlightPayload }
  | { type: 'updateFlight'; payload: { id: string; data: AddFlightPayload } }
  | { type: 'removeFlight'; payload: string }
  | { type: 'toggleFlightSelection'; payload: { id: string; selected: boolean } }
  | { type: 'addHotel'; payload: AddHotelPayload }
  | { type: 'updateHotel'; payload: { id: string; data: AddHotelPayload } }
  | { type: 'removeHotel'; payload: string }
  | { type: 'toggleHotelSelection'; payload: { id: string; selected: boolean } }
  | { type: 'addRental'; payload: AddRentalPayload }
  | { type: 'updateRental'; payload: { id: string; data: AddRentalPayload } }
  | { type: 'removeRental'; payload: string }
  | { type: 'toggleRentalSelection'; payload: { id: string; selected: boolean } }
  | { type: 'addTrain'; payload: AddTrainPayload }
  | { type: 'updateTrain'; payload: { id: string; data: AddTrainPayload } }
  | { type: 'removeTrain'; payload: string }
  | { type: 'toggleTrainSelection'; payload: { id: string; selected: boolean } }
  | { type: 'clearAll' };

const defaultState: TravelDataState = {
  flights: [],
  hotels: [],
  rentals: [],
  trains: [],
};

const generateId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

const reducer = (state: TravelDataState, action: TravelDataAction): TravelDataState => {
  switch (action.type) {
    case 'hydrate':
      return {
        flights: (action.payload.flights ?? []).map((flight) => ({
          ...flight,
          hasConnection: flight.hasConnection ?? false,
        })),
        hotels: action.payload.hotels ?? [],
        rentals: action.payload.rentals ?? [],
        trains: action.payload.trains ?? [],
      };
    case 'addFlight': {
      const flight: FlightOption = { id: generateId(), selected: false, ...action.payload };
      return { ...state, flights: [...state.flights, flight] };
    }
    case 'updateFlight':
      return {
        ...state,
        flights: state.flights.map((flight) =>
          flight.id === action.payload.id ? { ...flight, ...action.payload.data } : flight,
        ),
      };
    case 'removeFlight':
      return { ...state, flights: state.flights.filter((flight) => flight.id !== action.payload) };
    case 'toggleFlightSelection':
      return {
        ...state,
        flights: state.flights.map((flight) =>
          flight.id === action.payload.id ? { ...flight, selected: action.payload.selected } : flight,
        ),
      };
    case 'addHotel': {
      const hotel: HotelOption = { id: generateId(), selected: false, ...action.payload };
      return { ...state, hotels: [...state.hotels, hotel] };
    }
    case 'updateHotel':
      return {
        ...state,
        hotels: state.hotels.map((hotel) =>
          hotel.id === action.payload.id ? { ...hotel, ...action.payload.data } : hotel,
        ),
      };
    case 'removeHotel':
      return { ...state, hotels: state.hotels.filter((hotel) => hotel.id !== action.payload) };
    case 'toggleHotelSelection':
      return {
        ...state,
        hotels: state.hotels.map((hotel) =>
          hotel.id === action.payload.id ? { ...hotel, selected: action.payload.selected } : hotel,
        ),
      };
    case 'addRental': {
      const rental: RentalCarOption = { id: generateId(), selected: false, ...action.payload };
      return { ...state, rentals: [...state.rentals, rental] };
    }
    case 'updateRental':
      return {
        ...state,
        rentals: state.rentals.map((rental) =>
          rental.id === action.payload.id ? { ...rental, ...action.payload.data } : rental,
        ),
      };
    case 'removeRental':
      return { ...state, rentals: state.rentals.filter((rental) => rental.id !== action.payload) };
    case 'toggleRentalSelection':
      return {
        ...state,
        rentals: state.rentals.map((rental) =>
          rental.id === action.payload.id ? { ...rental, selected: action.payload.selected } : rental,
        ),
      };
    case 'addTrain': {
      const train: TrainOption = { id: generateId(), selected: false, ...action.payload };
      return { ...state, trains: [...state.trains, train] };
    }
    case 'updateTrain':
      return {
        ...state,
        trains: state.trains.map((train) =>
          train.id === action.payload.id ? { ...train, ...action.payload.data } : train,
        ),
      };
    case 'removeTrain':
      return { ...state, trains: state.trains.filter((train) => train.id !== action.payload) };
    case 'toggleTrainSelection':
      return {
        ...state,
        trains: state.trains.map((train) =>
          train.id === action.payload.id ? { ...train, selected: action.payload.selected } : train,
        ),
      };
    case 'clearAll':
      return { ...defaultState };
    default:
      return state;
  }
};

interface ProviderProps {
  children: ReactNode;
  storage?: TravelDataStore;
}

export const TravelDataProvider = ({ children, storage }: ProviderProps) => {
  const persistence = useMemo(() => storage ?? new LocalTravelDataStore(), [storage]);
  const [state, dispatch] = useReducer(reducer, defaultState);

  useEffect(() => {
    const stored = persistence.load();
    if (stored) {
      dispatch({ type: 'hydrate', payload: stored });
    }
  }, [persistence]);

  useEffect(() => {
    persistence.save(state);
  }, [state, persistence]);

  const value = useMemo<TravelDataContextValue>(
    () => ({
      ...state,
      addFlight: (flight) => dispatch({ type: 'addFlight', payload: flight }),
      updateFlight: (id, data) => dispatch({ type: 'updateFlight', payload: { id, data } }),
      toggleFlightSelection: (id, selected) =>
        dispatch({ type: 'toggleFlightSelection', payload: { id, selected } }),
      removeFlight: (id) => dispatch({ type: 'removeFlight', payload: id }),
      addHotel: (hotel) => dispatch({ type: 'addHotel', payload: hotel }),
      updateHotel: (id, data) => dispatch({ type: 'updateHotel', payload: { id, data } }),
      toggleHotelSelection: (id, selected) =>
        dispatch({ type: 'toggleHotelSelection', payload: { id, selected } }),
      removeHotel: (id) => dispatch({ type: 'removeHotel', payload: id }),
      addRental: (rental) => dispatch({ type: 'addRental', payload: rental }),
      updateRental: (id, data) => dispatch({ type: 'updateRental', payload: { id, data } }),
      toggleRentalSelection: (id, selected) =>
        dispatch({ type: 'toggleRentalSelection', payload: { id, selected } }),
      removeRental: (id) => dispatch({ type: 'removeRental', payload: id }),
      addTrain: (train) => dispatch({ type: 'addTrain', payload: train }),
      updateTrain: (id, data) => dispatch({ type: 'updateTrain', payload: { id, data } }),
      toggleTrainSelection: (id, selected) =>
        dispatch({ type: 'toggleTrainSelection', payload: { id, selected } }),
      removeTrain: (id) => dispatch({ type: 'removeTrain', payload: id }),
      clearAll: () => {
        persistence.clear();
        dispatch({ type: 'clearAll' });
      },
    }),
    [state, persistence],
  );

  return <TravelDataContext.Provider value={value}>{children}</TravelDataContext.Provider>;
};
