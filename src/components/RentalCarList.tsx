import { useTravelData } from '../context/useTravelData';
import { calculateDayDiff, formatCurrency, formatDate } from '../utils/format';

export const RentalCarList = () => {
  const { rentals, toggleRentalSelection, removeRental } = useTravelData();

  if (rentals.length === 0) {
    return <p className="empty-state">No rental cars added yet.</p>;
  }

  return (
    <div className="option-list">
      {rentals.map((rental) => {
        const days = calculateDayDiff(rental.pickupDate, rental.dropoffDate);
        const estimatedTotal = days ? rental.dailyRate * days : undefined;

        return (
          <article key={rental.id} className={`option-card ${rental.selected ? 'selected' : ''}`}>
            <header className="option-card__header">
              <div>
                <h4>{rental.company}</h4>
                <p className="muted">{formatCurrency(rental.dailyRate)} per day</p>
              </div>
              <label className="select-control">
                <input
                  type="checkbox"
                  checked={rental.selected}
                  onChange={(event) => toggleRentalSelection(rental.id, event.target.checked)}
                />
                <span>Select</span>
              </label>
            </header>
            <dl className="option-card__details">
              <div>
                <dt>Pickup location</dt>
                <dd>{rental.pickupLocation}</dd>
              </div>
              <div>
                <dt>Drop-off location</dt>
                <dd>{rental.dropoffLocation}</dd>
              </div>
              <div>
                <dt>Pickup date</dt>
                <dd>{formatDate(rental.pickupDate)}</dd>
              </div>
              <div>
                <dt>Drop-off date</dt>
                <dd>{formatDate(rental.dropoffDate)}</dd>
              </div>
              {days && (
                <div>
                  <dt>Duration</dt>
                  <dd>{days} day{days > 1 ? 's' : ''}</dd>
                </div>
              )}
              {estimatedTotal && (
                <div>
                  <dt>Estimated total</dt>
                  <dd>{formatCurrency(estimatedTotal)}</dd>
                </div>
              )}
            </dl>
            <footer className="option-card__footer">
              <button type="button" className="link" onClick={() => removeRental(rental.id)}>
                Remove
              </button>
            </footer>
          </article>
        );
      })}
    </div>
  );
};
