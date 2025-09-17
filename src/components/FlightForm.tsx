import { type FormEvent, useState } from 'react';
import { useTravelData } from '../context/useTravelData';

const emptyForm = {
  airline: '',
  flightCode: '',
  route: '',
  departure: '',
  priceCad: '',
  pricePoints: '',
  pointsPartner: '',
};

export const FlightForm = () => {
  const { addFlight } = useTravelData();
  const [formState, setFormState] = useState(emptyForm);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.airline || !formState.flightCode || !formState.route || !formState.departure) {
      return;
    }

    const priceCad = Number.parseFloat(formState.priceCad);
    const pricePoints = formState.pricePoints ? Number.parseFloat(formState.pricePoints) : undefined;

    if (Number.isNaN(priceCad)) {
      return;
    }

    addFlight({
      airline: formState.airline.trim(),
      flightCode: formState.flightCode.trim(),
      route: formState.route.trim(),
      departure: formState.departure,
      priceCad,
      pricePoints,
      pointsPartner: formState.pointsPartner.trim() || undefined,
    });

    setFormState(emptyForm);
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h3>Add a flight option</h3>
      <div className="form-grid">
        <label>
          Airline
          <input
            required
            value={formState.airline}
            onChange={(event) => setFormState((state) => ({ ...state, airline: event.target.value }))}
            placeholder="e.g. Air Canada"
          />
        </label>
        <label>
          Flight code
          <input
            required
            value={formState.flightCode}
            onChange={(event) => setFormState((state) => ({ ...state, flightCode: event.target.value }))}
            placeholder="e.g. AC 890"
          />
        </label>
        <label>
          Route
          <input
            required
            value={formState.route}
            onChange={(event) => setFormState((state) => ({ ...state, route: event.target.value }))}
            placeholder="e.g. Toronto → Milan"
          />
        </label>
        <label>
          Departure
          <input
            required
            type="datetime-local"
            value={formState.departure}
            onChange={(event) => setFormState((state) => ({ ...state, departure: event.target.value }))}
          />
        </label>
        <label>
          Price (CAD)
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={formState.priceCad}
            onChange={(event) => setFormState((state) => ({ ...state, priceCad: event.target.value }))}
          />
        </label>
        <label>
          Price in points
          <input
            type="number"
            min="0"
            step="1"
            value={formState.pricePoints}
            onChange={(event) => setFormState((state) => ({ ...state, pricePoints: event.target.value }))}
            placeholder="e.g. 65000"
          />
        </label>
        <label>
          Points partner
          <input
            value={formState.pointsPartner}
            onChange={(event) => setFormState((state) => ({ ...state, pointsPartner: event.target.value }))}
            placeholder="e.g. Aeroplan"
          />
        </label>
      </div>
      <button type="submit" className="primary">Add flight</button>
    </form>
  );
};
