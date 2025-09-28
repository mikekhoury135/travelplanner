import { useMemo } from 'react';
import { useTravelData } from '../context/useTravelData';
import { calculateDayDiff, formatCurrency, formatDateTime } from '../utils/format';

const getRentalTotal = (dailyRate: number, pickupDate: string, dropoffDate: string) => {
  const days = calculateDayDiff(pickupDate, dropoffDate) ?? 1;
  return {
    days,
    total: dailyRate * days,
  };
};

export const SelectionSummary = () => {
  const { flights, hotels, rentals, trains, clearAll } = useTravelData();

  const summary = useMemo(() => {
    const selectedFlights = flights.filter((flight) => flight.selected);
    const selectedHotels = hotels.filter((hotel) => hotel.selected);
    const selectedRentals = rentals.filter((rental) => rental.selected);
    const selectedTrains = trains.filter((train) => train.selected);

    const flightCost = selectedFlights.reduce((total, flight) => total + flight.priceCad, 0);
    const flightPoints = selectedFlights.reduce((total, flight) => total + (flight.pricePoints ?? 0), 0);

    const hotelCost = selectedHotels.reduce((total, hotel) => total + hotel.priceCad, 0);

    const rentalSummaries = selectedRentals.map((rental) => ({
      rental,
      ...getRentalTotal(rental.dailyRate, rental.pickupDate, rental.dropoffDate),
    }));
    const rentalCost = rentalSummaries.reduce((total, item) => total + item.total, 0);

    const trainCost = selectedTrains.reduce((total, train) => total + train.priceCad, 0);

    return {
      selectedFlights,
      selectedHotels,
      rentalSummaries,
      selectedTrains,
      totals: {
        flightCost,
        flightPoints,
        hotelCost,
        rentalCost,
        trainCost,
        grandTotal: flightCost + hotelCost + rentalCost + trainCost,
      },
    };
  }, [flights, hotels, rentals, trains]);

  const nothingSelected =
    summary.selectedFlights.length === 0 &&
    summary.selectedHotels.length === 0 &&
    summary.rentalSummaries.length === 0 &&
    summary.selectedTrains.length === 0;

  return (
    <section className="summary">
      <header className="summary__header">
        <div>
          <h2>Your selected itinerary</h2>
          <p className="muted">A running total of the options you have marked as selected.</p>
        </div>
        <button type="button" className="link" onClick={clearAll}>
          Clear all data
        </button>
      </header>

      {nothingSelected ? (
        <p className="empty-state">Select options to build your itinerary summary.</p>
      ) : (
        <div className="summary__grid">
          {summary.selectedFlights.length > 0 && (
            <section>
              <h3>Flights</h3>
              <ul className="summary__list">
                {summary.selectedFlights.map((flight) => (
                  <li key={flight.id}>
                    <strong>
                      {flight.airline} {flight.flightCode}
                    </strong>
                    <span>{formatCurrency(flight.priceCad)}</span>
                    {typeof flight.pricePoints === 'number' && (
                      <span>
                        {flight.pricePoints.toLocaleString('en-CA')} points
                        {flight.pointsPartner ? ` via ${flight.pointsPartner}` : ''}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <p className="summary__total">Flight total: {formatCurrency(summary.totals.flightCost)}</p>
              {summary.totals.flightPoints > 0 && (
                <p className="muted">
                  Points required: {summary.totals.flightPoints.toLocaleString('en-CA')}
                </p>
              )}
            </section>
          )}

          {summary.selectedHotels.length > 0 && (
            <section>
              <h3>Hotels</h3>
              <ul className="summary__list">
                {summary.selectedHotels.map((hotel) => (
                  <li key={hotel.id}>
                    <strong>{hotel.name}</strong>
                    <span>{formatCurrency(hotel.priceCad)}</span>
                  </li>
                ))}
              </ul>
              <p className="summary__total">Hotel total: {formatCurrency(summary.totals.hotelCost)}</p>
            </section>
          )}

          {summary.rentalSummaries.length > 0 && (
            <section>
              <h3>Rental cars</h3>
              <ul className="summary__list">
                {summary.rentalSummaries.map(({ rental, days, total }) => (
                  <li key={rental.id}>
                    <strong>{rental.company}</strong>
                    <span>
                      {days} day{days > 1 ? 's' : ''} × {formatCurrency(rental.dailyRate)}
                    </span>
                    <span>{formatCurrency(total)}</span>
                  </li>
                ))}
              </ul>
              <p className="summary__total">Rental total: {formatCurrency(summary.totals.rentalCost)}</p>
              <p className="muted">Rental totals assume one day if an end date is not provided.</p>
            </section>
          )}

          {summary.selectedTrains.length > 0 && (
            <section>
              <h3>Trains</h3>
              <ul className="summary__list">
                {summary.selectedTrains.map((train) => (
                  <li key={train.id}>
                    <strong>
                      {train.startingPoint} → {train.destination}
                    </strong>
                    <span>{formatCurrency(train.priceCad)}</span>
                    {train.departureTime && <span>{formatDateTime(train.departureTime)}</span>}
                  </li>
                ))}
              </ul>
              <p className="summary__total">Train total: {formatCurrency(summary.totals.trainCost)}</p>
            </section>
          )}
        </div>
      )}

      {!nothingSelected && (
        <footer className="summary__footer">
          <h3>Grand total</h3>
          <p className="summary__grand">{formatCurrency(summary.totals.grandTotal)}</p>
        </footer>
      )}
    </section>
  );
};
