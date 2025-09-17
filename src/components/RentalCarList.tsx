import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useTravelData } from '../context/useTravelData';
import type { AddRentalPayload, RentalCarOption } from '../types';
import { calculateDayDiff, formatCurrency, formatDate } from '../utils/format';

interface RentalDraft {
  company: string;
  dailyRate: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
}

const createDraft = (rental: RentalCarOption): RentalDraft => ({
  company: rental.company,
  dailyRate: rental.dailyRate.toString(),
  pickupLocation: rental.pickupLocation,
  dropoffLocation: rental.dropoffLocation,
  pickupDate: rental.pickupDate,
  dropoffDate: rental.dropoffDate,
});

const RentalCard = ({
  rental,
  onToggleSelection,
  onRemove,
  onUpdate,
}: {
  rental: RentalCarOption;
  onToggleSelection: (selected: boolean) => void;
  onRemove: () => void;
  onUpdate: (payload: AddRentalPayload) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<RentalDraft>(() => createDraft(rental));

  useEffect(() => {
    if (!isEditing) {
      setDraft(createDraft(rental));
    }
  }, [rental, isEditing]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!draft.company || !draft.pickupLocation || !draft.dropoffLocation) {
      return;
    }

    const dailyRate = Number.parseFloat(draft.dailyRate);
    if (Number.isNaN(dailyRate)) {
      return;
    }

    onUpdate({
      company: draft.company.trim(),
      dailyRate,
      pickupLocation: draft.pickupLocation.trim(),
      dropoffLocation: draft.dropoffLocation.trim(),
      pickupDate: draft.pickupDate,
      dropoffDate: draft.dropoffDate,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(createDraft(rental));
    setIsEditing(false);
  };

  const { days, estimatedTotal } = useMemo(() => {
    const dayCount = calculateDayDiff(rental.pickupDate, rental.dropoffDate);
    const total = dayCount ? rental.dailyRate * dayCount : undefined;
    return { days: dayCount, estimatedTotal: total };
  }, [rental.dailyRate, rental.dropoffDate, rental.pickupDate]);

  const displayRate = isEditing ? Number.parseFloat(draft.dailyRate) : rental.dailyRate;
  const formattedRate = Number.isNaN(displayRate)
    ? isEditing
      ? draft.dailyRate || '—'
      : formatCurrency(rental.dailyRate)
    : formatCurrency(displayRate);

  return (
    <article className={`option-card ${rental.selected ? 'selected' : ''}`}>
      <header className="option-card__header">
        <div>
          <h4>{isEditing ? draft.company || rental.company : rental.company}</h4>
          <p className="muted">{formattedRate} per day</p>
        </div>
        <label className="select-control">
          <input
            type="checkbox"
            checked={rental.selected}
            onChange={(event) => onToggleSelection(event.target.checked)}
          />
          <span>Select</span>
        </label>
      </header>

      {isEditing ? (
        <form className="option-card__edit" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Company
              <input
                required
                value={draft.company}
                onChange={(event) => setDraft((state) => ({ ...state, company: event.target.value }))}
              />
            </label>
            <label>
              Daily rate (CAD)
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={draft.dailyRate}
                onChange={(event) => setDraft((state) => ({ ...state, dailyRate: event.target.value }))}
              />
            </label>
            <label>
              Pickup location
              <input
                required
                value={draft.pickupLocation}
                onChange={(event) => setDraft((state) => ({ ...state, pickupLocation: event.target.value }))}
              />
            </label>
            <label>
              Drop-off location
              <input
                required
                value={draft.dropoffLocation}
                onChange={(event) => setDraft((state) => ({ ...state, dropoffLocation: event.target.value }))}
              />
            </label>
            <label>
              Pickup date
              <input
                type="date"
                value={draft.pickupDate}
                onChange={(event) => setDraft((state) => ({ ...state, pickupDate: event.target.value }))}
              />
            </label>
            <label>
              Drop-off date
              <input
                type="date"
                value={draft.dropoffDate}
                onChange={(event) => setDraft((state) => ({ ...state, dropoffDate: event.target.value }))}
              />
            </label>
          </div>
          <div className="option-card__actions">
            <button type="submit" className="primary">
              Save rental
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
                <dd>
                  {days} day{days > 1 ? 's' : ''}
                </dd>
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

export const RentalCarList = () => {
  const { rentals, toggleRentalSelection, removeRental, updateRental } = useTravelData();

  if (rentals.length === 0) {
    return <p className="empty-state">No rental cars added yet.</p>;
  }

  return (
    <div className="option-list">
      {rentals.map((rental) => (
        <RentalCard
          key={rental.id}
          rental={rental}
          onToggleSelection={(selected) => toggleRentalSelection(rental.id, selected)}
          onRemove={() => removeRental(rental.id)}
          onUpdate={(payload) => updateRental(rental.id, payload)}
        />
      ))}
    </div>
  );
};
