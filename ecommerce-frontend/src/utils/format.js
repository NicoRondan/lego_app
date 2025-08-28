export function formatMoney(value, currency = 'USD', locale) {
  const amount = Number(value || 0);
  try {
    return new Intl.NumberFormat(locale || (typeof navigator !== 'undefined' ? navigator.language : 'es-AR'), {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch (_e) {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

