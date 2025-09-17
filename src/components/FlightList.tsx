import { type FormEvent, useEffect, useState } from 'react';
import { useTravelData } from '../context/useTravelData';
import type { AddFlightPayload, FlightOption } from '../types';
import { formatCurrency, formatDateTime } from '../utils/format';

interface FlightDraft {
  airline: string;
  flightCode: string;
  route: string;
  departure: string;
  priceCad: string;
  pricePoints: string;
  pointsPartner: string;
  hasConnection: boolean;
  totalDuration: string;
}

const createDraft = (flight: FlightOption): FlightDraft => ({
  airline: flight.airline,
  flightCode: flight.flightCode,
  route: flight.route,
  departure: flight.departure,
  priceCad: flight.priceCad.toString(),
  pricePoints: typeof flight.pricePoints === 'number' ? flight.pricePoints.toString() : '',
  pointsPartner: flight.pointsPartner ?? '',
  hasConnection: flight.hasConnection,
  totalDuration: flight.totalDuration ?? '',
});

const FlightCard = ({
  flight,
  onToggleSelection,
  onRemove,
  onUpdate,
}: {
  flight: FlightOption;
  onToggleSelection: (selected: boolean) => void;
  onRemove: () => void;
  onUpdate: (payload: AddFlightPayload) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<FlightDraft>(() => createDraft(flight));

  useEffect(() => {
    if (!isEditing) {
      setDraft(createDraft(flight));
    }
  }, [flight, isEditing]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!draft.airline || !draft.flightCode || !draft.route || !draft.departure) {
      return;
    }

    const priceCad = Number.parseFloat(draft.priceCad);
    if (Number.isNaN(priceCad)) {
      return;
    }

    const pricePoints = draft.pricePoints ? Number.parseFloat(draft.pricePoints) : undefined;
    if (draft.pricePoints && (pricePoints === undefined || Number.isNaN(pricePoints))) {
      return;
    }

    onUpdate({
      airline: draft.airline.trim(),
      flightCode: draft.flightCode.trim(),
      route: draft.route.trim(),
      departure: draft.departure,
      priceCad,
      pricePoints,
      pointsPartner: draft.pointsPartner.trim() || undefined,
      hasConnection: draft.hasConnection,
      totalDuration: draft.totalDuration.trim() || undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(createDraft(flight));
    setIsEditing(false);
  };

  return (
    <article className={`option-card ${flight.selected ? 'selected' : ''}`}>
      <header className="option-card__header">
        <div>
          <h4>{isEditing ? draft.airline || flight.airline : flight.airline}</h4>
          <p className="muted">{isEditing ? draft.flightCode || flight.flightCode : flight.flightCode}</p>
        </div>
        <label className="select-control">
          <input
            type="checkbox"
            checked={flight.selected}
            onChange={(event) => onToggleSelection(event.target.checked)}
          />
          <span>Select</span>
        </label>
      </header>

      {isEditing ? (
        <form className="option-card__edit" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Airline
              <input
                required
                value={draft.airline}
                onChange={(event) => setDraft((state) => ({ ...state, airline: event.target.value }))}
              />
            </label>
            <label>
              Flight code
              <input
                required
                value={draft.flightCode}
                onChange={(event) => setDraft((state) => ({ ...state, flightCode: event.target.value }))}
              />
            </label>
            <label>
              Route
              <input
                required
                value={draft.route}
                onChange={(event) => setDraft((state) => ({ ...state, route: event.target.value }))}
              />
            </label>
            <label>
              Departure
              <input
                required
                type="datetime-local"
                value={draft.departure}
                onChange={(event) => setDraft((state) => ({ ...state, departure: event.target.value }))}
              />
            </label>
            <label>
              Total travel time
              <input
                value={draft.totalDuration}
                onChange={(event) => setDraft((state) => ({ ...state, totalDuration: event.target.value }))}
              />
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={draft.hasConnection}
                onChange={(event) => setDraft((state) => ({ ...state, hasConnection: event.target.checked }))}
              />
              Connecting flight
            </label>
            <label>
              Price (CAD)
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={draft.priceCad}
                onChange={(event) => setDraft((state) => ({ ...state, priceCad: event.target.value }))}
              />
            </label>
            <label>
              Price in points
              <input
                type="number"
                min="0"
                step="1"
                value={draft.pricePoints}
                onChange={(event) => setDraft((state) => ({ ...state, pricePoints: event.target.value }))}
              />
            </label>
            <label>
              Points partner
              <input
                value={draft.pointsPartner}
                onChange={(event) => setDraft((state) => ({ ...state, pointsPartner: event.target.value }))}
              />
            </label>
          </div>
          <div className="option-card__actions">
            <button type="submit" className="primary">
              Save flight
            </button>
            <button type="button" className="link" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
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
              <dt>Total travel time</dt>
              <dd>{flight.totalDuration ?? '—'}</dd>
            </div>
            <div>
              <dt>Connection</dt>
              <dd>{flight.hasConnection ? 'Yes' : 'No'}</dd>
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
            <button type="button" className="link" onClick={() => setIsEditing(true)}>
              Edit
            </button>
            <button type="button" className="link" onClick={onRemove}>
              Remove
            </button>
          </footer>
        </>
      )}
    </article>
  );
};

export const FlightList = () => {
  const { flights, toggleFlightSelection, removeFlight, updateFlight } = useTravelData();

  if (flights.length === 0) {
    return <p className="empty-state">No flights added yet.</p>;
  }

  return (
    <div className="option-list">
      {flights.map((flight) => (
        <FlightCard
          key={flight.id}
          flight={flight}
          onToggleSelection={(selected) => toggleFlightSelection(flight.id, selected)}
          onRemove={() => removeFlight(flight.id)}
          onUpdate={(payload) => updateFlight(flight.id, payload)}
        />
      ))}
    </div>
  );
};
