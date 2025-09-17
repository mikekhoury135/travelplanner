import { useTravelData } from '../context/useTravelData';
import { formatCurrency, formatDateTime } from '../utils/format';

export const FlightList = () => {
  const { flights, toggleFlightSelection, removeFlight } = useTravelData();

  if (flights.length === 0) {
    return <p className="empty-state">No flights added yet.</p>;
  }

  return (
    <div className="option-list">
      {flights.map((flight) => (
        <article key={flight.id} className={`option-card ${flight.selected ? 'selected' : ''}`}>
          <header className="option-card__header">
            <div>
              <h4>{flight.airline}</h4>
              <p className="muted">{flight.flightCode}</p>
            </div>
            <label className="select-control">
              <input
                type="checkbox"
                checked={flight.selected}
                onChange={(event) => toggleFlightSelection(flight.id, event.target.checked)}
              />
              <span>Select</span>
            </label>
          </header>
          <dl className="option-card__details">
            <div>
              <dt>Route</dt>
              <dd>{flight.route}</dd>
            </div>
            <div>
              <dt>Departure</dt>
              <dd>{formatDateTime(flight.departure)}</dd>
            </div>
            <div>
              <dt>Price (CAD)</dt>
              <dd>{formatCurrency(flight.priceCad)}</dd>
            </div>
            {typeof flight.pricePoints === 'number' && (
              <div>
                <dt>Points</dt>
                <dd>
                  {flight.pricePoints.toLocaleString('en-CA')}
                  {flight.pointsPartner ? ` via ${flight.pointsPartner}` : ''}
                </dd>
              </div>
            )}
          </dl>
          <footer className="option-card__footer">
            <button type="button" className="link" onClick={() => removeFlight(flight.id)}>
              Remove
            </button>
          </footer>
        </article>
      ))}
    </div>
  );
};
