import { type FormEvent, useState } from 'react';
import { useTravelData } from '../context/useTravelData';

const emptyForm = {
  company: '',
  dailyRate: '',
  pickupLocation: '',
  dropoffLocation: '',
  pickupDate: '',
  dropoffDate: '',
};

export const RentalCarForm = () => {
  const { addRental } = useTravelData();
  const [formState, setFormState] = useState(emptyForm);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.company || !formState.pickupLocation || !formState.dropoffLocation) {
      return;
    }

    const dailyRate = Number.parseFloat(formState.dailyRate);
    if (Number.isNaN(dailyRate)) {
      return;
    }

    addRental({
      company: formState.company.trim(),
      dailyRate,
      pickupLocation: formState.pickupLocation.trim(),
      dropoffLocation: formState.dropoffLocation.trim(),
      pickupDate: formState.pickupDate,
      dropoffDate: formState.dropoffDate,
    });

    setFormState(emptyForm);
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h3>Add a rental car option</h3>
      <div className="form-grid">
        <label>
          Company
          <input
            required
            value={formState.company}
            onChange={(event) => setFormState((state) => ({ ...state, company: event.target.value }))}
            placeholder="e.g. Hertz"
          />
        </label>
        <label>
          Daily rate (CAD)
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={formState.dailyRate}
            onChange={(event) => setFormState((state) => ({ ...state, dailyRate: event.target.value }))}
          />
        </label>
        <label>
          Pickup location
          <input
            required
            value={formState.pickupLocation}
            onChange={(event) => setFormState((state) => ({ ...state, pickupLocation: event.target.value }))}
            placeholder="City or airport"
          />
        </label>
        <label>
          Drop-off location
          <input
            required
            value={formState.dropoffLocation}
            onChange={(event) => setFormState((state) => ({ ...state, dropoffLocation: event.target.value }))}
            placeholder="City or airport"
          />
        </label>
        <label>
          Pickup date
          <input
            type="date"
            value={formState.pickupDate}
            onChange={(event) => setFormState((state) => ({ ...state, pickupDate: event.target.value }))}
          />
        </label>
        <label>
          Drop-off date
          <input
            type="date"
            value={formState.dropoffDate}
            onChange={(event) => setFormState((state) => ({ ...state, dropoffDate: event.target.value }))}
          />
        </label>
      </div>
      <button type="submit" className="primary">Add rental car</button>
    </form>
  );
};
