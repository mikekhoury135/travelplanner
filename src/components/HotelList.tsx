import { useTravelData } from '../context/useTravelData';
import { formatCurrency, formatDate } from '../utils/format';

const renderStars = (value: number | undefined) => {
  if (!value) {
    return '—';
  }

  const fullStars = Math.floor(value);
  const halfStar = value - fullStars >= 0.5;
  return `${'★'.repeat(fullStars)}${halfStar ? '½' : ''}`;
};

export const HotelList = () => {
  const { hotels, toggleHotelSelection, removeHotel } = useTravelData();

  if (hotels.length === 0) {
    return <p className="empty-state">No hotels added yet.</p>;
  }

  return (
    <div className="option-list">
      {hotels.map((hotel) => (
        <article key={hotel.id} className={`option-card ${hotel.selected ? 'selected' : ''}`}>
          <header className="option-card__header">
            <div>
              <h4>{hotel.name}</h4>
              <p className="muted">{hotel.city}</p>
            </div>
            <label className="select-control">
              <input
                type="checkbox"
                checked={hotel.selected}
                onChange={(event) => toggleHotelSelection(hotel.id, event.target.checked)}
              />
              <span>Select</span>
            </label>
          </header>
          <dl className="option-card__details">
            <div>
              <dt>Star rating</dt>
              <dd>{renderStars(hotel.starRating)}</dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>{hotel.address}</dd>
            </div>
            <div>
              <dt>Contact</dt>
              <dd>{hotel.contact}</dd>
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
            <button type="button" className="link" onClick={() => removeHotel(hotel.id)}>
              Remove
            </button>
          </footer>
        </article>
      ))}
    </div>
  );
};
