import { type FormEvent, useEffect, useState } from 'react';
import { useTravelData } from '../context/useTravelData';
import type { AddHotelPayload, HotelOption } from '../types';
import { formatCurrency, formatDate } from '../utils/format';

const renderStars = (value: number | undefined) => {
  if (!value) {
    return '—';
  }

  const fullStars = Math.floor(value);
  const halfStar = value - fullStars >= 0.5;
  return `${'★'.repeat(fullStars)}${halfStar ? '½' : ''}`;
};

interface HotelDraft {
  name: string;
  city: string;
  starRating: string;
  address: string;
  contact: string;
  checkIn: string;
  checkOut: string;
  priceCad: string;
}

const createDraft = (hotel: HotelOption): HotelDraft => ({
  name: hotel.name,
  city: hotel.city,
  starRating: hotel.starRating?.toString() ?? '',
  address: hotel.address ?? '',
  contact: hotel.contact ?? '',
  checkIn: hotel.checkIn,
  checkOut: hotel.checkOut,
  priceCad: hotel.priceCad.toString(),
});

const HotelCard = ({
  hotel,
  onToggleSelection,
  onRemove,
  onUpdate,
}: {
  hotel: HotelOption;
  onToggleSelection: (selected: boolean) => void;
  onRemove: () => void;
  onUpdate: (payload: AddHotelPayload) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<HotelDraft>(() => createDraft(hotel));

  useEffect(() => {
    if (!isEditing) {
      setDraft(createDraft(hotel));
    }
  }, [hotel, isEditing]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!draft.name || !draft.city) {
      return;
    }

    const priceCad = Number.parseFloat(draft.priceCad);
    if (Number.isNaN(priceCad)) {
      return;
    }

    const starRating = draft.starRating ? Number.parseFloat(draft.starRating) : undefined;
    if (draft.starRating && (starRating === undefined || Number.isNaN(starRating))) {
      return;
    }

    onUpdate({
      name: draft.name.trim(),
      city: draft.city.trim(),
      starRating,
      address: draft.address.trim() || undefined,
      contact: draft.contact.trim() || undefined,
      checkIn: draft.checkIn,
      checkOut: draft.checkOut,
      priceCad,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(createDraft(hotel));
    setIsEditing(false);
  };

  return (
    <article className={`option-card ${hotel.selected ? 'selected' : ''}`}>
      <header className="option-card__header">
        <div>
          <h4>{isEditing ? draft.name || hotel.name : hotel.name}</h4>
          <p className="muted">{isEditing ? draft.city || hotel.city : hotel.city}</p>
        </div>
        <label className="select-control">
          <input
            type="checkbox"
            checked={hotel.selected}
            onChange={(event) => onToggleSelection(event.target.checked)}
          />
          <span>Select</span>
        </label>
      </header>

      {isEditing ? (
        <form className="option-card__edit" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Hotel name
              <input
                required
                value={draft.name}
                onChange={(event) => setDraft((state) => ({ ...state, name: event.target.value }))}
              />
            </label>
            <label>
              City
              <input
                required
                value={draft.city}
                onChange={(event) => setDraft((state) => ({ ...state, city: event.target.value }))}
              />
            </label>
            <label>
              Star rating
              <input
                type="number"
                min="1"
                max="5"
                step="0.5"
                value={draft.starRating}
                onChange={(event) => setDraft((state) => ({ ...state, starRating: event.target.value }))}
              />
            </label>
            <label className="span-2">
              Address
              <input
                value={draft.address}
                onChange={(event) => setDraft((state) => ({ ...state, address: event.target.value }))}
              />
            </label>
            <label>
              Contact
              <input
                value={draft.contact}
                onChange={(event) => setDraft((state) => ({ ...state, contact: event.target.value }))}
              />
            </label>
            <label>
              Check-in date
              <input
                type="date"
                value={draft.checkIn}
                onChange={(event) => setDraft((state) => ({ ...state, checkIn: event.target.value }))}
              />
            </label>
            <label>
              Check-out date
              <input
                type="date"
                value={draft.checkOut}
                onChange={(event) => setDraft((state) => ({ ...state, checkOut: event.target.value }))}
              />
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
          </div>
          <div className="option-card__actions">
            <button type="submit" className="primary">
              Save hotel
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
              <dt>Star rating</dt>
              <dd>{renderStars(hotel.starRating)}</dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>{hotel.address ?? '—'}</dd>
            </div>
            <div>
              <dt>Contact</dt>
              <dd>{hotel.contact ?? '—'}</dd>
            </div>
            <div>
              <dt>Check-in</dt>
              <dd>{formatDate(hotel.checkIn)}</dd>
            </div>
            <div>
              <dt>Check-out</dt>
              <dd>{formatDate(hotel.checkOut)}</dd>
            </div>
            <div>
              <dt>Price (CAD)</dt>
              <dd>{formatCurrency(hotel.priceCad)}</dd>
            </div>
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

export const HotelList = () => {
  const { hotels, toggleHotelSelection, removeHotel, updateHotel } = useTravelData();

  if (hotels.length === 0) {
    return <p className="empty-state">No hotels added yet.</p>;
  }

  return (
    <div className="option-list">
      {hotels.map((hotel) => (
        <HotelCard
          key={hotel.id}
          hotel={hotel}
          onToggleSelection={(selected) => toggleHotelSelection(hotel.id, selected)}
          onRemove={() => removeHotel(hotel.id)}
          onUpdate={(payload) => updateHotel(hotel.id, payload)}
        />
      ))}
    </div>
  );
};
