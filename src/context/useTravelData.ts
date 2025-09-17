import { useContext } from 'react';
import { TravelDataContext } from './TravelDataContext';

export const useTravelData = () => {
  const context = useContext(TravelDataContext);
  if (!context) {
    throw new Error('useTravelData must be used within a TravelDataProvider');
  }

  return context;
};
