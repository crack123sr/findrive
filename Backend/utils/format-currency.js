// Convert rupees to paise when saving to MongoDB
export function convertToCents(amount) {
  return Math.round(Number(amount) * 100);
}

// Convert paise to rupees when retrieving from MongoDB
export function convertToDollarUnit(amount) {
  return Number(amount || 0) / 100;
}

// Format amount as Indian Rupees
export function formatCurrency(amount) {
  let value = Number(amount || 0);

  // Prevent -0.00
  if (Object.is(value, -0)) {
    value = 0;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}