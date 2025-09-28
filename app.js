const STORAGE_KEY = 'travel-planner-data-v2';

const currencyFormatter = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
});
const pointsFormatter = new Intl.NumberFormat('en-CA');
const dateFormatter = new Intl.DateTimeFormat('en-CA', { dateStyle: 'medium' });
const dateTimeFormatter = new Intl.DateTimeFormat('en-CA', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const emptyState = () => ({ flights: [], hotels: [], rentals: [], trains: [] });

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
};

const parseNumber = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
};

const parseOptionalNumber = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }
  const numeric = parseNumber(value);
  return numeric === null ? undefined : numeric;
};

const sanitizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const sanitizeOptionalString = (value) => {
  const trimmed = sanitizeString(value);
  return trimmed ? trimmed : undefined;
};

const sanitizeFlight = (raw) => {
  if (!raw) return null;
  const airline = sanitizeString(raw.airline);
  const flightCode = sanitizeString(raw.flightCode ?? raw.code);
  const route = sanitizeString(raw.route);
  const departure = typeof raw.departure === 'string' ? raw.departure : '';
  const priceCad = parseNumber(raw.priceCad);

  if (!airline || !flightCode || !route || !departure || priceCad === null) {
    return null;
  }

  const pricePoints = parseOptionalNumber(raw.pricePoints);
  const sanitized = {
    id: typeof raw.id === 'string' ? raw.id : generateId(),
    airline,
    flightCode,
    route,
    departure,
    priceCad,
    pricePoints,
    pointsPartner: sanitizeOptionalString(raw.pointsPartner),
    hasConnection: Boolean(raw.hasConnection),
    totalDuration: sanitizeOptionalString(raw.totalDuration),
    selected: Boolean(raw.selected),
  };
  return sanitized;
};

const sanitizeHotel = (raw) => {
  if (!raw) return null;
  const name = sanitizeString(raw.name ?? raw.hotelName);
  const city = sanitizeString(raw.city);
  const priceCad = parseNumber(raw.priceCad);
  const checkIn = typeof raw.checkIn === 'string' ? raw.checkIn : '';
  const checkOut = typeof raw.checkOut === 'string' ? raw.checkOut : '';

  if (!name || !city || priceCad === null || !checkIn || !checkOut) {
    return null;
  }

  const starRating = parseOptionalNumber(raw.starRating);

  return {
    id: typeof raw.id === 'string' ? raw.id : generateId(),
    name,
    city,
    starRating,
    address: sanitizeOptionalString(raw.address),
    contact: sanitizeOptionalString(raw.contact ?? raw.phone),
    checkIn,
    checkOut,
    priceCad,
    selected: Boolean(raw.selected),
  };
};

const sanitizeRental = (raw) => {
  if (!raw) return null;
  const company = sanitizeString(raw.company);
  const dailyRate = parseNumber(raw.dailyRate ?? raw.rate);
  const pickupLocation = sanitizeString(raw.pickupLocation ?? raw.pickup);
  const dropoffLocation = sanitizeString(raw.dropoffLocation ?? raw.dropoff);
  const pickupDate = typeof raw.pickupDate === 'string' ? raw.pickupDate : '';
  const dropoffDate = typeof raw.dropoffDate === 'string' ? raw.dropoffDate : '';

  if (!company || dailyRate === null || !pickupLocation || !dropoffLocation || !pickupDate) {
    return null;
  }

  return {
    id: typeof raw.id === 'string' ? raw.id : generateId(),
    company,
    dailyRate,
    pickupLocation,
    dropoffLocation,
    pickupDate,
    dropoffDate,
    selected: Boolean(raw.selected),
  };
};

const sanitizeTrain = (raw) => {
  if (!raw) return null;
  const startingPoint = sanitizeString(raw.startingPoint ?? raw.origin);
  const destination = sanitizeString(raw.destination);
  const priceCad = parseNumber(raw.priceCad);

  if (!startingPoint || !destination || priceCad === null) {
    return null;
  }

  return {
    id: typeof raw.id === 'string' ? raw.id : generateId(),
    startingPoint,
    destination,
    departureTime: typeof raw.departureTime === 'string' && raw.departureTime ? raw.departureTime : undefined,
    station: sanitizeOptionalString(raw.station),
    stationAddress: sanitizeOptionalString(raw.stationAddress),
    priceCad,
    selected: Boolean(raw.selected),
  };
};

const sanitizeCollection = (items, sanitizer) => {
  if (!Array.isArray(items)) {
    return [];
  }
  return items
    .map((item) => {
      try {
        return sanitizer(item);
      } catch (error) {
        console.warn('Failed to sanitize item', error);
        return null;
      }
    })
    .filter(Boolean);
};

const sanitizeState = (raw) => ({
  flights: sanitizeCollection(raw?.flights, sanitizeFlight),
  hotels: sanitizeCollection(raw?.hotels, sanitizeHotel),
  rentals: sanitizeCollection(raw?.rentals, sanitizeRental),
  trains: sanitizeCollection(raw?.trains, sanitizeTrain),
});

const loadState = () => {
  if (typeof window === 'undefined') {
    return emptyState();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return emptyState();
    }
    const parsed = JSON.parse(raw);
    return sanitizeState(parsed);
  } catch (error) {
    console.warn('Unable to load stored travel data.', error);
    return emptyState();
  }
};

let state = loadState();

const saveState = () => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Unable to save travel data.', error);
  }
};

const formatCurrency = (amount) => currencyFormatter.format(amount ?? 0);
const formatPoints = (points) =>
  typeof points === 'number' ? `${pointsFormatter.format(points)} points` : undefined;

const parseLocalDate = (value) => {
  if (typeof value !== 'string' || !value) {
    return null;
  }
  const [year, month, day] = value.split('-').map((part) => Number.parseInt(part, 10));
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }
  return new Date(year, month - 1, day);
};

const parseLocalDateTime = (value) => {
  if (typeof value !== 'string' || !value) {
    return null;
  }
  const [datePart, timePart] = value.split('T');
  if (!datePart) {
    return null;
  }
  const [year, month, day] = datePart.split('-').map((part) => Number.parseInt(part, 10));
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }
  let hours = 0;
  let minutes = 0;
  if (timePart) {
    const [h, m] = timePart.split(':').map((part) => Number.parseInt(part, 10));
    if (Number.isFinite(h)) {
      hours = h;
    }
    if (Number.isFinite(m)) {
      minutes = m;
    }
  }
  return new Date(year, month - 1, day, hours, minutes);
};

const formatDate = (value) => {
  const date = parseLocalDate(value);
  return date ? dateFormatter.format(date) : value;
};

const formatDateTime = (value) => {
  const date = parseLocalDateTime(value);
  return date ? dateTimeFormatter.format(date) : value;
};

const calculateDayDiff = (start, end) => {
  const startDate = parseLocalDate(start);
  const endDate = parseLocalDate(end);
  if (!startDate) {
    return 1;
  }
  if (!endDate) {
    return 1;
  }
  const diff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
};

const getRentalTotal = (rental) => {
  const days = calculateDayDiff(rental.pickupDate, rental.dropoffDate);
  return {
    days,
    total: rental.dailyRate * days,
  };
};

const createEmptyMessage = (text) => {
  const message = document.createElement('p');
  message.className = 'empty-state';
  message.textContent = text;
  return message;
};

const detailRow = (label, value) => {
  if (!value) {
    return null;
  }
  const row = document.createElement('div');
  row.className = 'detail-row';
  const term = document.createElement('span');
  term.className = 'detail-label';
  term.textContent = label;
  const detail = document.createElement('span');
  detail.className = 'detail-value';
  detail.textContent = value;
  row.append(term, detail);
  return row;
};

const flightForm = document.getElementById('flight-form');
const flightList = document.getElementById('flight-list');
const flightSubmit = flightForm.querySelector('[data-action-button]');
const flightCancel = flightForm.querySelector('[data-cancel-edit]');
const flightStatus = flightForm.querySelector('[data-editing-message]');

const hotelForm = document.getElementById('hotel-form');
const hotelList = document.getElementById('hotel-list');
const hotelSubmit = hotelForm.querySelector('[data-action-button]');
const hotelCancel = hotelForm.querySelector('[data-cancel-edit]');
const hotelStatus = hotelForm.querySelector('[data-editing-message]');

const rentalForm = document.getElementById('rental-form');
const rentalList = document.getElementById('rental-list');
const rentalSubmit = rentalForm.querySelector('[data-action-button]');
const rentalCancel = rentalForm.querySelector('[data-cancel-edit]');
const rentalStatus = rentalForm.querySelector('[data-editing-message]');

const trainForm = document.getElementById('train-form');
const trainList = document.getElementById('train-list');
const trainSubmit = trainForm.querySelector('[data-action-button]');
const trainCancel = trainForm.querySelector('[data-cancel-edit]');
const trainStatus = trainForm.querySelector('[data-editing-message]');

const summaryContent = document.getElementById('summary-content');
const summaryFooter = document.getElementById('summary-footer');
const grandTotalEl = document.getElementById('grand-total');
const clearButton = document.getElementById('clear-data');

const resetForm = (form, submitButton, cancelButton, status) => {
  form.reset();
  delete form.dataset.editId;
  if (submitButton?.dataset?.defaultLabel) {
    submitButton.textContent = submitButton.dataset.defaultLabel;
  }
  status?.classList.add('hidden');
  cancelButton?.classList.add('hidden');
};

const startEditing = (form, submitButton, cancelButton, status, label) => {
  if (submitButton?.dataset?.editLabel) {
    submitButton.textContent = submitButton.dataset.editLabel;
  }
  if (status) {
    status.textContent = label;
    status.classList.remove('hidden');
  }
  cancelButton?.classList.remove('hidden');
};

const handleFlightSubmit = (event) => {
  event.preventDefault();
  const data = new FormData(flightForm);
  const airline = sanitizeString(data.get('airline'));
  const flightCode = sanitizeString(data.get('flightCode'));
  const route = sanitizeString(data.get('route'));
  const departure = data.get('departure');
  const priceCad = parseNumber(data.get('priceCad'));

  if (!airline || !flightCode || !route || typeof departure !== 'string' || !departure || priceCad === null) {
    return;
  }

  const payload = {
    airline,
    flightCode,
    route,
    departure,
    priceCad,
    pricePoints: parseOptionalNumber(data.get('pricePoints')),
    pointsPartner: sanitizeOptionalString(data.get('pointsPartner')),
    hasConnection: data.get('hasConnection') === 'on',
    totalDuration: sanitizeOptionalString(data.get('totalDuration')),
  };

  const editId = flightForm.dataset.editId;
  if (editId) {
    state.flights = state.flights.map((flight) => (flight.id === editId ? { ...flight, ...payload } : flight));
  } else {
    state.flights = [...state.flights, { id: generateId(), selected: false, ...payload }];
  }

  saveState();
  renderFlights();
  renderSummary();
  resetForm(flightForm, flightSubmit, flightCancel, flightStatus);
};

const populateFlightForm = (flight) => {
  resetForm(flightForm, flightSubmit, flightCancel, flightStatus);
  flightForm.dataset.editId = flight.id;
  flightForm.querySelector('[name="airline"]').value = flight.airline;
  flightForm.querySelector('[name="flightCode"]').value = flight.flightCode;
  flightForm.querySelector('[name="route"]').value = flight.route;
  flightForm.querySelector('[name="departure"]').value = flight.departure;
  flightForm.querySelector('[name="totalDuration"]').value = flight.totalDuration ?? '';
  flightForm.querySelector('[name="hasConnection"]').checked = Boolean(flight.hasConnection);
  flightForm.querySelector('[name="priceCad"]').value = flight.priceCad.toString();
  flightForm.querySelector('[name="pricePoints"]').value =
    typeof flight.pricePoints === 'number' ? flight.pricePoints.toString() : '';
  flightForm.querySelector('[name="pointsPartner"]').value = flight.pointsPartner ?? '';
  startEditing(flightForm, flightSubmit, flightCancel, flightStatus, 'Editing existing flight');
};

const handleHotelSubmit = (event) => {
  event.preventDefault();
  const data = new FormData(hotelForm);
  const name = sanitizeString(data.get('name'));
  const city = sanitizeString(data.get('city'));
  const priceCad = parseNumber(data.get('priceCad'));
  const checkIn = data.get('checkIn');
  const checkOut = data.get('checkOut');

  if (!name || !city || priceCad === null || typeof checkIn !== 'string' || !checkIn || typeof checkOut !== 'string' || !checkOut) {
    return;
  }

  const payload = {
    name,
    city,
    starRating: parseOptionalNumber(data.get('starRating')),
    address: sanitizeOptionalString(data.get('address')),
    contact: sanitizeOptionalString(data.get('contact')),
    checkIn,
    checkOut,
    priceCad,
  };

  const editId = hotelForm.dataset.editId;
  if (editId) {
    state.hotels = state.hotels.map((hotel) => (hotel.id === editId ? { ...hotel, ...payload } : hotel));
  } else {
    state.hotels = [...state.hotels, { id: generateId(), selected: false, ...payload }];
  }

  saveState();
  renderHotels();
  renderSummary();
  resetForm(hotelForm, hotelSubmit, hotelCancel, hotelStatus);
};

const populateHotelForm = (hotel) => {
  resetForm(hotelForm, hotelSubmit, hotelCancel, hotelStatus);
  hotelForm.dataset.editId = hotel.id;
  hotelForm.querySelector('[name="name"]').value = hotel.name;
  hotelForm.querySelector('[name="city"]').value = hotel.city;
  hotelForm.querySelector('[name="starRating"]').value =
    typeof hotel.starRating === 'number' ? hotel.starRating.toString() : '';
  hotelForm.querySelector('[name="address"]').value = hotel.address ?? '';
  hotelForm.querySelector('[name="contact"]').value = hotel.contact ?? '';
  hotelForm.querySelector('[name="checkIn"]').value = hotel.checkIn;
  hotelForm.querySelector('[name="checkOut"]').value = hotel.checkOut;
  hotelForm.querySelector('[name="priceCad"]').value = hotel.priceCad.toString();
  startEditing(hotelForm, hotelSubmit, hotelCancel, hotelStatus, 'Editing existing hotel');
};

const handleRentalSubmit = (event) => {
  event.preventDefault();
  const data = new FormData(rentalForm);
  const company = sanitizeString(data.get('company'));
  const pickupLocation = sanitizeString(data.get('pickupLocation'));
  const dropoffLocation = sanitizeString(data.get('dropoffLocation'));
  const pickupDate = data.get('pickupDate');
  const dropoffDate = data.get('dropoffDate');
  const dailyRate = parseNumber(data.get('dailyRate'));

  if (!company || !pickupLocation || !dropoffLocation || typeof pickupDate !== 'string' || !pickupDate || dailyRate === null) {
    return;
  }

  const payload = {
    company,
    pickupLocation,
    dropoffLocation,
    pickupDate,
    dropoffDate: typeof dropoffDate === 'string' ? dropoffDate : '',
    dailyRate,
  };

  const editId = rentalForm.dataset.editId;
  if (editId) {
    state.rentals = state.rentals.map((rental) => (rental.id === editId ? { ...rental, ...payload } : rental));
  } else {
    state.rentals = [...state.rentals, { id: generateId(), selected: false, ...payload }];
  }

  saveState();
  renderRentals();
  renderSummary();
  resetForm(rentalForm, rentalSubmit, rentalCancel, rentalStatus);
};

const populateRentalForm = (rental) => {
  resetForm(rentalForm, rentalSubmit, rentalCancel, rentalStatus);
  rentalForm.dataset.editId = rental.id;
  rentalForm.querySelector('[name="company"]').value = rental.company;
  rentalForm.querySelector('[name="dailyRate"]').value = rental.dailyRate.toString();
  rentalForm.querySelector('[name="pickupLocation"]').value = rental.pickupLocation;
  rentalForm.querySelector('[name="dropoffLocation"]').value = rental.dropoffLocation;
  rentalForm.querySelector('[name="pickupDate"]').value = rental.pickupDate;
  rentalForm.querySelector('[name="dropoffDate"]').value = rental.dropoffDate ?? '';
  startEditing(rentalForm, rentalSubmit, rentalCancel, rentalStatus, 'Editing existing rental car');
};

const handleTrainSubmit = (event) => {
  event.preventDefault();
  const data = new FormData(trainForm);
  const startingPoint = sanitizeString(data.get('startingPoint'));
  const destination = sanitizeString(data.get('destination'));
  const priceCad = parseNumber(data.get('priceCad'));
  const departureTime = data.get('departureTime');

  if (!startingPoint || !destination || priceCad === null) {
    return;
  }

  const payload = {
    startingPoint,
    destination,
    departureTime: typeof departureTime === 'string' && departureTime ? departureTime : undefined,
    station: sanitizeOptionalString(data.get('station')),
    stationAddress: sanitizeOptionalString(data.get('stationAddress')),
    priceCad,
  };

  const editId = trainForm.dataset.editId;
  if (editId) {
    state.trains = state.trains.map((train) => (train.id === editId ? { ...train, ...payload } : train));
  } else {
    state.trains = [...state.trains, { id: generateId(), selected: false, ...payload }];
  }

  saveState();
  renderTrains();
  renderSummary();
  resetForm(trainForm, trainSubmit, trainCancel, trainStatus);
};

const populateTrainForm = (train) => {
  resetForm(trainForm, trainSubmit, trainCancel, trainStatus);
  trainForm.dataset.editId = train.id;
  trainForm.querySelector('[name="startingPoint"]').value = train.startingPoint;
  trainForm.querySelector('[name="destination"]').value = train.destination;
  trainForm.querySelector('[name="departureTime"]').value = train.departureTime ?? '';
  trainForm.querySelector('[name="station"]').value = train.station ?? '';
  trainForm.querySelector('[name="stationAddress"]').value = train.stationAddress ?? '';
  trainForm.querySelector('[name="priceCad"]').value = train.priceCad.toString();
  startEditing(trainForm, trainSubmit, trainCancel, trainStatus, 'Editing existing train');
};

const renderFlights = () => {
  flightList.innerHTML = '';
  if (state.flights.length === 0) {
    flightList.appendChild(createEmptyMessage('No flights added yet.'));
    return;
  }

  state.flights.forEach((flight) => {
    const card = document.createElement('article');
    card.className = 'option-card';
    if (flight.selected) {
      card.classList.add('selected');
    }

    const top = document.createElement('div');
    top.className = 'option-card__top';
    const title = document.createElement('div');
    title.className = 'option-card__title';

    const heading = document.createElement('h4');
    heading.textContent = flight.airline;
    const subtitle = document.createElement('p');
    subtitle.className = 'muted';
    subtitle.textContent = flight.flightCode;

    title.append(heading, subtitle);

    const selectLabel = document.createElement('label');
    selectLabel.className = 'select-control';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = flight.selected;
    checkbox.addEventListener('change', (event) => {
      const selected = event.target.checked;
      state.flights = state.flights.map((item) =>
        item.id === flight.id ? { ...item, selected } : item,
      );
      saveState();
      renderFlights();
      renderSummary();
    });
    const selectText = document.createElement('span');
    selectText.textContent = 'Select';
    selectLabel.append(checkbox, selectText);

    top.append(title, selectLabel);

    const details = document.createElement('div');
    details.className = 'option-card__details';
    const routeRow = detailRow('Route', flight.route);
    const departureRow = detailRow('Departure', formatDateTime(flight.departure));
    const durationRow = detailRow('Total time', flight.totalDuration);
    const priceRow = detailRow('Price', formatCurrency(flight.priceCad));
    const connectionRow = detailRow('Connection', flight.hasConnection ? 'Yes' : 'No');
    const pointsValue =
      typeof flight.pricePoints === 'number'
        ? `${formatPoints(flight.pricePoints)}${
            flight.pointsPartner ? ` via ${flight.pointsPartner}` : ''
          }`
        : undefined;
    const pointsRow = detailRow('Points', pointsValue);

    [routeRow, departureRow, durationRow, priceRow, connectionRow, pointsRow]
      .filter(Boolean)
      .forEach((row) => details.appendChild(row));

    const footer = document.createElement('div');
    footer.className = 'option-card__footer';
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'link';
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => populateFlightForm(flight));

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'link danger';
    removeButton.textContent = 'Delete';
    removeButton.addEventListener('click', () => {
      state.flights = state.flights.filter((item) => item.id !== flight.id);
      saveState();
      renderFlights();
      renderSummary();
      if (flightForm.dataset.editId === flight.id) {
        resetForm(flightForm, flightSubmit, flightCancel, flightStatus);
      }
    });

    footer.append(editButton, removeButton);

    card.append(top, details, footer);
    flightList.appendChild(card);
  });
};

const renderHotels = () => {
  hotelList.innerHTML = '';
  if (state.hotels.length === 0) {
    hotelList.appendChild(createEmptyMessage('No hotels added yet.'));
    return;
  }

  state.hotels.forEach((hotel) => {
    const card = document.createElement('article');
    card.className = 'option-card';
    if (hotel.selected) {
      card.classList.add('selected');
    }

    const top = document.createElement('div');
    top.className = 'option-card__top';
    const title = document.createElement('div');
    title.className = 'option-card__title';
    const heading = document.createElement('h4');
    heading.textContent = hotel.name;
    const subtitle = document.createElement('p');
    subtitle.className = 'muted';
    subtitle.textContent = hotel.city;
    title.append(heading, subtitle);

    const selectLabel = document.createElement('label');
    selectLabel.className = 'select-control';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = hotel.selected;
    checkbox.addEventListener('change', (event) => {
      const selected = event.target.checked;
      state.hotels = state.hotels.map((item) =>
        item.id === hotel.id ? { ...item, selected } : item,
      );
      saveState();
      renderHotels();
      renderSummary();
    });
    const selectText = document.createElement('span');
    selectText.textContent = 'Select';
    selectLabel.append(checkbox, selectText);

    top.append(title, selectLabel);

    const details = document.createElement('div');
    details.className = 'option-card__details';
    const ratingRow = detailRow(
      'Star rating',
      typeof hotel.starRating === 'number' ? hotel.starRating.toString() : undefined,
    );
    const addressRow = detailRow('Address', hotel.address);
    const contactRow = detailRow('Contact', hotel.contact);
    const checkInRow = detailRow('Check-in', formatDate(hotel.checkIn));
    const checkOutRow = detailRow('Check-out', formatDate(hotel.checkOut));
    const priceRow = detailRow('Price', formatCurrency(hotel.priceCad));

    [ratingRow, addressRow, contactRow, checkInRow, checkOutRow, priceRow]
      .filter(Boolean)
      .forEach((row) => details.appendChild(row));

    const footer = document.createElement('div');
    footer.className = 'option-card__footer';
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'link';
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => populateHotelForm(hotel));

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'link danger';
    removeButton.textContent = 'Delete';
    removeButton.addEventListener('click', () => {
      state.hotels = state.hotels.filter((item) => item.id !== hotel.id);
      saveState();
      renderHotels();
      renderSummary();
      if (hotelForm.dataset.editId === hotel.id) {
        resetForm(hotelForm, hotelSubmit, hotelCancel, hotelStatus);
      }
    });

    footer.append(editButton, removeButton);

    card.append(top, details, footer);
    hotelList.appendChild(card);
  });
};

const renderRentals = () => {
  rentalList.innerHTML = '';
  if (state.rentals.length === 0) {
    rentalList.appendChild(createEmptyMessage('No rental cars added yet.'));
    return;
  }

  state.rentals.forEach((rental) => {
    const card = document.createElement('article');
    card.className = 'option-card';
    if (rental.selected) {
      card.classList.add('selected');
    }

    const top = document.createElement('div');
    top.className = 'option-card__top';
    const title = document.createElement('div');
    title.className = 'option-card__title';
    const heading = document.createElement('h4');
    heading.textContent = rental.company;
    const subtitle = document.createElement('p');
    subtitle.className = 'muted';
    subtitle.textContent = `${rental.pickupLocation} → ${rental.dropoffLocation}`;
    title.append(heading, subtitle);

    const selectLabel = document.createElement('label');
    selectLabel.className = 'select-control';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = rental.selected;
    checkbox.addEventListener('change', (event) => {
      const selected = event.target.checked;
      state.rentals = state.rentals.map((item) =>
        item.id === rental.id ? { ...item, selected } : item,
      );
      saveState();
      renderRentals();
      renderSummary();
    });
    const selectText = document.createElement('span');
    selectText.textContent = 'Select';
    selectLabel.append(checkbox, selectText);

    top.append(title, selectLabel);

    const details = document.createElement('div');
    details.className = 'option-card__details';
    const pickupRow = detailRow('Pickup', formatDate(rental.pickupDate));
    const dropoffRow = detailRow('Drop-off', rental.dropoffDate ? formatDate(rental.dropoffDate) : '');
    const rateRow = detailRow('Daily rate', formatCurrency(rental.dailyRate));

    [pickupRow, dropoffRow, rateRow].filter(Boolean).forEach((row) => details.appendChild(row));

    const footer = document.createElement('div');
    footer.className = 'option-card__footer';
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'link';
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => populateRentalForm(rental));

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'link danger';
    removeButton.textContent = 'Delete';
    removeButton.addEventListener('click', () => {
      state.rentals = state.rentals.filter((item) => item.id !== rental.id);
      saveState();
      renderRentals();
      renderSummary();
      if (rentalForm.dataset.editId === rental.id) {
        resetForm(rentalForm, rentalSubmit, rentalCancel, rentalStatus);
      }
    });

    footer.append(editButton, removeButton);

    card.append(top, details, footer);
    rentalList.appendChild(card);
  });
};

const renderTrains = () => {
  trainList.innerHTML = '';
  if (state.trains.length === 0) {
    trainList.appendChild(createEmptyMessage('No trains added yet.'));
    return;
  }

  state.trains.forEach((train) => {
    const card = document.createElement('article');
    card.className = 'option-card';
    if (train.selected) {
      card.classList.add('selected');
    }

    const top = document.createElement('div');
    top.className = 'option-card__top';
    const title = document.createElement('div');
    title.className = 'option-card__title';
    const heading = document.createElement('h4');
    heading.textContent = `${train.startingPoint} → ${train.destination}`;
    const subtitle = document.createElement('p');
    subtitle.className = 'muted';
    subtitle.textContent = train.station ? train.station : 'Train option';
    title.append(heading, subtitle);

    const selectLabel = document.createElement('label');
    selectLabel.className = 'select-control';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = train.selected;
    checkbox.addEventListener('change', (event) => {
      const selected = event.target.checked;
      state.trains = state.trains.map((item) => (item.id === train.id ? { ...item, selected } : item));
      saveState();
      renderTrains();
      renderSummary();
    });
    const selectText = document.createElement('span');
    selectText.textContent = 'Select';
    selectLabel.append(checkbox, selectText);

    top.append(title, selectLabel);

    const details = document.createElement('div');
    details.className = 'option-card__details';
    const timeRow = detailRow('Departure', train.departureTime ? formatDateTime(train.departureTime) : '');
    const stationRow = detailRow('Station', train.station);
    const addressRow = detailRow('Station address', train.stationAddress);
    const priceRow = detailRow('Price', formatCurrency(train.priceCad));

    [timeRow, stationRow, addressRow, priceRow]
      .filter(Boolean)
      .forEach((row) => details.appendChild(row));

    const footer = document.createElement('div');
    footer.className = 'option-card__footer';
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'link';
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => populateTrainForm(train));

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'link danger';
    removeButton.textContent = 'Delete';
    removeButton.addEventListener('click', () => {
      state.trains = state.trains.filter((item) => item.id !== train.id);
      saveState();
      renderTrains();
      renderSummary();
      if (trainForm.dataset.editId === train.id) {
        resetForm(trainForm, trainSubmit, trainCancel, trainStatus);
      }
    });

    footer.append(editButton, removeButton);

    card.append(top, details, footer);
    trainList.appendChild(card);
  });
};

const renderSummary = () => {
  summaryContent.innerHTML = '';
  const selectedFlights = state.flights.filter((flight) => flight.selected);
  const selectedHotels = state.hotels.filter((hotel) => hotel.selected);
  const selectedRentals = state.rentals.filter((rental) => rental.selected);
  const selectedTrains = state.trains.filter((train) => train.selected);

  if (
    selectedFlights.length === 0 &&
    selectedHotels.length === 0 &&
    selectedRentals.length === 0 &&
    selectedTrains.length === 0
  ) {
    summaryContent.appendChild(
      createEmptyMessage('Select options to build your itinerary summary.'),
    );
    summaryFooter.classList.add('hidden');
    grandTotalEl.textContent = formatCurrency(0);
    return;
  }

  const flightCost = selectedFlights.reduce((total, flight) => total + flight.priceCad, 0);
  const flightPoints = selectedFlights.reduce(
    (total, flight) => total + (typeof flight.pricePoints === 'number' ? flight.pricePoints : 0),
    0,
  );
  const hotelCost = selectedHotels.reduce((total, hotel) => total + hotel.priceCad, 0);
  const rentalSummaries = selectedRentals.map((rental) => ({
    rental,
    ...getRentalTotal(rental),
  }));
  const rentalCost = rentalSummaries.reduce((total, entry) => total + entry.total, 0);
  const trainCost = selectedTrains.reduce((total, train) => total + train.priceCad, 0);
  const grandTotal = flightCost + hotelCost + rentalCost + trainCost;

  if (selectedFlights.length > 0) {
    const section = document.createElement('section');
    section.className = 'summary-section';
    const heading = document.createElement('h3');
    heading.textContent = 'Flights';
    const list = document.createElement('ul');
    selectedFlights.forEach((flight) => {
      const item = document.createElement('li');
      const title = document.createElement('strong');
      title.textContent = `${flight.airline} ${flight.flightCode}`;
      const price = document.createElement('span');
      price.textContent = formatCurrency(flight.priceCad);
      item.append(title, price);
      if (typeof flight.pricePoints === 'number') {
        const points = document.createElement('span');
        points.className = 'muted';
        const partnerLabel = flight.pointsPartner ? ` via ${flight.pointsPartner}` : '';
        points.textContent = `${formatPoints(flight.pricePoints)}${partnerLabel}`;
        item.appendChild(points);
      }
      list.appendChild(item);
    });
    const total = document.createElement('p');
    total.className = 'summary__total';
    total.textContent = `Flight total: ${formatCurrency(flightCost)}`;
    section.append(heading, list, total);
    if (flightPoints > 0) {
      const pointsLine = document.createElement('p');
      pointsLine.className = 'muted';
      pointsLine.textContent = `Points required: ${pointsFormatter.format(flightPoints)}`;
      section.appendChild(pointsLine);
    }
    summaryContent.appendChild(section);
  }

  if (selectedHotels.length > 0) {
    const section = document.createElement('section');
    section.className = 'summary-section';
    const heading = document.createElement('h3');
    heading.textContent = 'Hotels';
    const list = document.createElement('ul');
    selectedHotels.forEach((hotel) => {
      const item = document.createElement('li');
      const title = document.createElement('strong');
      title.textContent = hotel.name;
      const city = document.createElement('span');
      city.className = 'muted';
      city.textContent = hotel.city;
      const price = document.createElement('span');
      price.textContent = formatCurrency(hotel.priceCad);
      item.append(title, city, price);
      list.appendChild(item);
    });
    const total = document.createElement('p');
    total.className = 'summary__total';
    total.textContent = `Hotel total: ${formatCurrency(hotelCost)}`;
    section.append(heading, list, total);
    summaryContent.appendChild(section);
  }

  if (selectedRentals.length > 0) {
    const section = document.createElement('section');
    section.className = 'summary-section';
    const heading = document.createElement('h3');
    heading.textContent = 'Rental cars';
    const list = document.createElement('ul');
    rentalSummaries.forEach(({ rental, days, total }) => {
      const item = document.createElement('li');
      const title = document.createElement('strong');
      title.textContent = rental.company;
      const duration = document.createElement('span');
      const durationLabel = `${days} day${days > 1 ? 's' : ''} × ${formatCurrency(rental.dailyRate)}`;
      duration.textContent = durationLabel;
      const price = document.createElement('span');
      price.textContent = formatCurrency(total);
      item.append(title, duration, price);
      list.appendChild(item);
    });
    const totalLine = document.createElement('p');
    totalLine.className = 'summary__total';
    totalLine.textContent = `Rental total: ${formatCurrency(rentalCost)}`;
    const note = document.createElement('p');
    note.className = 'muted';
    note.textContent = 'Totals assume one day if a drop-off date is not provided.';
    section.append(heading, list, totalLine, note);
    summaryContent.appendChild(section);
  }

  if (selectedTrains.length > 0) {
    const section = document.createElement('section');
    section.className = 'summary-section';
    const heading = document.createElement('h3');
    heading.textContent = 'Trains';
    const list = document.createElement('ul');
    selectedTrains.forEach((train) => {
      const item = document.createElement('li');
      const title = document.createElement('strong');
      title.textContent = `${train.startingPoint} → ${train.destination}`;
      const price = document.createElement('span');
      price.textContent = formatCurrency(train.priceCad);
      item.append(title, price);
      if (train.departureTime) {
        const time = document.createElement('span');
        time.className = 'muted';
        time.textContent = formatDateTime(train.departureTime);
        item.appendChild(time);
      }
      list.appendChild(item);
    });
    const total = document.createElement('p');
    total.className = 'summary__total';
    total.textContent = `Train total: ${formatCurrency(trainCost)}`;
    section.append(heading, list, total);
    summaryContent.appendChild(section);
  }

  summaryFooter.classList.remove('hidden');
  grandTotalEl.textContent = formatCurrency(grandTotal);
};

flightForm.addEventListener('submit', handleFlightSubmit);
flightCancel.addEventListener('click', () => resetForm(flightForm, flightSubmit, flightCancel, flightStatus));

hotelForm.addEventListener('submit', handleHotelSubmit);
hotelCancel.addEventListener('click', () => resetForm(hotelForm, hotelSubmit, hotelCancel, hotelStatus));

rentalForm.addEventListener('submit', handleRentalSubmit);
rentalCancel.addEventListener('click', () => resetForm(rentalForm, rentalSubmit, rentalCancel, rentalStatus));

trainForm.addEventListener('submit', handleTrainSubmit);
trainCancel.addEventListener('click', () => resetForm(trainForm, trainSubmit, trainCancel, trainStatus));

clearButton.addEventListener('click', () => {
  if (
    state.flights.length === 0 &&
    state.hotels.length === 0 &&
    state.rentals.length === 0 &&
    state.trains.length === 0
  ) {
    return;
  }
  const confirmed = window.confirm('This will remove all saved travel data. Continue?');
  if (!confirmed) {
    return;
  }
  state = emptyState();
  saveState();
  renderFlights();
  renderHotels();
  renderRentals();
  renderTrains();
  renderSummary();
  resetForm(flightForm, flightSubmit, flightCancel, flightStatus);
  resetForm(hotelForm, hotelSubmit, hotelCancel, hotelStatus);
  resetForm(rentalForm, rentalSubmit, rentalCancel, rentalStatus);
  resetForm(trainForm, trainSubmit, trainCancel, trainStatus);
});

const renderAll = () => {
  renderFlights();
  renderHotels();
  renderRentals();
  renderTrains();
  renderSummary();
};

renderAll();
