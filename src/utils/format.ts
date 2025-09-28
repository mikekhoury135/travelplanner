const currencyFormatter = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
});

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const parseInputDate = (value: string | undefined) => {
  if (!value) {
    return undefined;
  }

  if (value.includes('T')) {
    const dateTime = new Date(value);
    return Number.isNaN(dateTime.getTime()) ? undefined : dateTime;
  }

  const [year, month, day] = value.split('-').map((part) => Number.parseInt(part, 10));
  if (!year || !month || !day) {
    return undefined;
  }

  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export const formatCurrency = (value: number) => currencyFormatter.format(value);

export const formatDate = (value: string | undefined) => {
  const date = parseInputDate(value);
  return date ? dateFormatter.format(date) : '—';
};

export const formatDateTime = (value: string | undefined) => {
  const date = parseInputDate(value);
  return date ? dateTimeFormatter.format(date) : '—';
};

export const calculateDayDiff = (start: string | undefined, end: string | undefined) => {
  const startDate = parseInputDate(start);
  const endDate = parseInputDate(end);

  if (!startDate || !endDate) {
    return undefined;
  }

  const diffMs = endDate.getTime() - startDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 0) {
    return undefined;
  }

  if (diffDays < 1) {
    return 1;
  }

  return Math.round(diffDays);
};
