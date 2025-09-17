export interface FlightOption {
  id: string;
  airline: string;
  flightCode: string;
  route: string;
  departure: string; // ISO string representing the departure date and time
  priceCad: number;
  pricePoints?: number;
  pointsPartner?: string;
  hasConnection: boolean;
  totalDuration?: string;
  selected: boolean;
}

export interface HotelOption {
  id: string;
  name: string;
  city: string;
  starRating?: number;
  address?: string;
  contact?: string;
  checkIn: string; // ISO date string
  checkOut: string; // ISO date string
  priceCad: number;
  selected: boolean;
}

export interface RentalCarOption {
  id: string;
  company: string;
  dailyRate: number;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string; // ISO date string
  dropoffDate: string; // ISO date string
  selected: boolean;
}

export interface TrainOption {
  id: string;
  startingPoint: string;
  destination: string;
  departureTime?: string; // ISO string representing departure date and time
  station?: string;
  stationAddress?: string;
  priceCad: number;
  selected: boolean;
}

export interface TravelDataState {
  flights: FlightOption[];
  hotels: HotelOption[];
  rentals: RentalCarOption[];
  trains: TrainOption[];
}

export type AddFlightPayload = Omit<FlightOption, 'id' | 'selected'>;
export type AddHotelPayload = Omit<HotelOption, 'id' | 'selected'>;
export type AddRentalPayload = Omit<RentalCarOption, 'id' | 'selected'>;
export type AddTrainPayload = Omit<TrainOption, 'id' | 'selected'>;
