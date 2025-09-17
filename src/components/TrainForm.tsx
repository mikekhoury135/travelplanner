import { type FormEvent, useState } from 'react';
import { useTravelData } from '../context/useTravelData';

const emptyForm = {
  startingPoint: '',
  destination: '',
  departureTime: '',
  station: '',
  stationAddress: '',
  priceCad: '',
};

export const TrainForm = () => {
  const { addTrain } = useTravelData();
  const [formState, setFormState] = useState(emptyForm);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.startingPoint || !formState.destination || !formState.priceCad) {
      return;
    }

    const priceCad = Number.parseFloat(formState.priceCad);
    if (Number.isNaN(priceCad)) {
      return;
    }

    addTrain({
      startingPoint: formState.startingPoint.trim(),
      destination: formState.destination.trim(),
      departureTime: formState.departureTime,
      station: formState.station.trim() || undefined,
      stationAddress: formState.stationAddress.trim() || undefined,
      priceCad,
    });

    setFormState(emptyForm);
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h3>Add a train option</h3>
      <div className="form-grid">
        <label>
          Starting point
          <input
            required
            value={formState.startingPoint}
            onChange={(event) =>
              setFormState((state) => ({ ...state, startingPoint: event.target.value }))
            }
            placeholder="e.g. Milan"
          />
        </label>
        <label>
          Destination
          <input
            required
            value={formState.destination}
            onChange={(event) => setFormState((state) => ({ ...state, destination: event.target.value }))}
            placeholder="e.g. Florence"
          />
        </label>
        <label>
          Departure time
          <input
            type="datetime-local"
            value={formState.departureTime}
            onChange={(event) =>
              setFormState((state) => ({ ...state, departureTime: event.target.value }))
            }
          />
        </label>
        <label>
          Station
          <input
            value={formState.station}
            onChange={(event) => setFormState((state) => ({ ...state, station: event.target.value }))}
            placeholder="e.g. Milano Centrale"
          />
        </label>
        <label>
          Station address
          <input
            value={formState.stationAddress}
            onChange={(event) =>
              setFormState((state) => ({ ...state, stationAddress: event.target.value }))
            }
            placeholder="Street, city"
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
      </div>
      <button type="submit" className="primary">
        Add train
      </button>
    </form>
  );
};
