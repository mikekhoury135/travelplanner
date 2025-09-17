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

export const formatCurrency = (value: number) => currencyFormatter.format(value);

export const formatDate = (value: string | undefined) => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
};

export const formatDateTime = (value: string | undefined) => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateTimeFormatter.format(date);
};

export const calculateDayDiff = (start: string | undefined, end: string | undefined) => {
  if (!start || !end) {
    return undefined;
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
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
