import { type FormEvent, useState } from 'react';
import { useTravelData } from '../context/useTravelData';

const emptyForm = {
  name: '',
  city: '',
  starRating: '',
  address: '',
  contact: '',
  checkIn: '',
  checkOut: '',
  priceCad: '',
};

export const HotelForm = () => {
  const { addHotel } = useTravelData();
  const [formState, setFormState] = useState(emptyForm);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.name || !formState.city) {
      return;
    }

    const priceCad = Number.parseFloat(formState.priceCad);
    const starRating = formState.starRating ? Number.parseFloat(formState.starRating) : undefined;

    if (Number.isNaN(priceCad)) {
      return;
    }

    addHotel({
      name: formState.name.trim(),
      city: formState.city.trim(),
      starRating,
      address: formState.address.trim() || undefined,
      contact: formState.contact.trim() || undefined,
      checkIn: formState.checkIn,
      checkOut: formState.checkOut,
      priceCad,
    });

    setFormState(emptyForm);
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h3>Add a hotel option</h3>
      <div className="form-grid">
        <label>
          Hotel name
          <input
            required
            value={formState.name}
            onChange={(event) => setFormState((state) => ({ ...state, name: event.target.value }))}
            placeholder="e.g. Hotel Milano Scala"
          />
        </label>
        <label>
          City
          <input
            required
            value={formState.city}
            onChange={(event) => setFormState((state) => ({ ...state, city: event.target.value }))}
            placeholder="e.g. Milan"
          />
        </label>
        <label>
          Star rating
          <input
            type="number"
            min="1"
            max="5"
            step="0.5"
            value={formState.starRating}
            onChange={(event) => setFormState((state) => ({ ...state, starRating: event.target.value }))}
          />
        </label>
        <label className="span-2">
          Address
          <input
            value={formState.address}
            onChange={(event) => setFormState((state) => ({ ...state, address: event.target.value }))}
            placeholder="Street, city, country"
          />
        </label>
        <label>
          Contact
          <input
            value={formState.contact}
            onChange={(event) => setFormState((state) => ({ ...state, contact: event.target.value }))}
            placeholder="Phone or email"
          />
        </label>
        <label>
          Check-in date
          <input
            type="date"
            value={formState.checkIn}
            onChange={(event) => setFormState((state) => ({ ...state, checkIn: event.target.value }))}
          />
        </label>
        <label>
          Check-out date
          <input
            type="date"
            value={formState.checkOut}
            onChange={(event) => setFormState((state) => ({ ...state, checkOut: event.target.value }))}
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
      <button type="submit" className="primary">Add hotel</button>
    </form>
  );
};
