import { type FormEvent, useEffect, useState } from 'react';
import { useTravelData } from '../context/useTravelData';
import type { AddTrainPayload, TrainOption } from '../types';
import { formatCurrency, formatDateTime } from '../utils/format';

interface TrainDraft {
  startingPoint: string;
  destination: string;
  departureTime: string;
  station: string;
  stationAddress: string;
  priceCad: string;
}

const createDraft = (train: TrainOption): TrainDraft => ({
  startingPoint: train.startingPoint,
  destination: train.destination,
  departureTime: train.departureTime ?? '',
  station: train.station ?? '',
  stationAddress: train.stationAddress ?? '',
  priceCad: train.priceCad.toString(),
});

const TrainCard = ({
  train,
  onToggleSelection,
  onRemove,
  onUpdate,
}: {
  train: TrainOption;
  onToggleSelection: (selected: boolean) => void;
  onRemove: () => void;
  onUpdate: (payload: AddTrainPayload) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<TrainDraft>(() => createDraft(train));

  useEffect(() => {
    if (!isEditing) {
      setDraft(createDraft(train));
    }
  }, [train, isEditing]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!draft.startingPoint || !draft.destination || !draft.priceCad) {
      return;
    }

    const priceCad = Number.parseFloat(draft.priceCad);
    if (Number.isNaN(priceCad)) {
      return;
    }

    onUpdate({
      startingPoint: draft.startingPoint.trim(),
      destination: draft.destination.trim(),
      departureTime: draft.departureTime,
      station: draft.station.trim() || undefined,
      stationAddress: draft.stationAddress.trim() || undefined,
      priceCad,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(createDraft(train));
    setIsEditing(false);
  };

  const displayDeparture = isEditing ? draft.departureTime : train.departureTime;

  return (
    <article className={`option-card ${train.selected ? 'selected' : ''}`}>
      <header className="option-card__header">
        <div>
          <h4>
            {isEditing
              ? `${draft.startingPoint || train.startingPoint} → ${draft.destination || train.destination}`
              : `${train.startingPoint} → ${train.destination}`}
          </h4>
          <p className="muted">{formatDateTime(displayDeparture)}</p>
        </div>
        <label className="select-control">
          <input
            type="checkbox"
            checked={train.selected}
            onChange={(event) => onToggleSelection(event.target.checked)}
          />
          <span>Select</span>
        </label>
      </header>

      {isEditing ? (
        <form className="option-card__edit" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Starting point
              <input
                required
                value={draft.startingPoint}
                onChange={(event) => setDraft((state) => ({ ...state, startingPoint: event.target.value }))}
              />
            </label>
            <label>
              Destination
              <input
                required
                value={draft.destination}
                onChange={(event) => setDraft((state) => ({ ...state, destination: event.target.value }))}
              />
            </label>
            <label>
              Departure time
              <input
                type="datetime-local"
                value={draft.departureTime}
                onChange={(event) => setDraft((state) => ({ ...state, departureTime: event.target.value }))}
              />
            </label>
            <label>
              Station
              <input
                value={draft.station}
                onChange={(event) => setDraft((state) => ({ ...state, station: event.target.value }))}
              />
            </label>
            <label>
              Station address
              <input
                value={draft.stationAddress}
                onChange={(event) => setDraft((state) => ({ ...state, stationAddress: event.target.value }))}
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
              Save train
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
              <dt>Departure time</dt>
              <dd>{formatDateTime(train.departureTime)}</dd>
            </div>
            <div>
              <dt>Station</dt>
              <dd>{train.station ?? '—'}</dd>
            </div>
            <div>
              <dt>Station address</dt>
              <dd>{train.stationAddress ?? '—'}</dd>
            </div>
            <div>
              <dt>Price (CAD)</dt>
              <dd>{formatCurrency(train.priceCad)}</dd>
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

export const TrainList = () => {
  const { trains, toggleTrainSelection, removeTrain, updateTrain } = useTravelData();

  if (trains.length === 0) {
    return <p className="empty-state">No trains added yet.</p>;
  }

  return (
    <div className="option-list">
      {trains.map((train) => (
        <TrainCard
          key={train.id}
          train={train}
          onToggleSelection={(selected) => toggleTrainSelection(train.id, selected)}
          onRemove={() => removeTrain(train.id)}
          onUpdate={(payload) => updateTrain(train.id, payload)}
        />
      ))}
    </div>
  );
};
