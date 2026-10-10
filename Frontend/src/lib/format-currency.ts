export const formatCurrency = (value: number,
  options: { 
    currency?: string; 
    decimalPlaces?: number;
    compact?: boolean;
    showSign?: boolean;
    isExpense?: boolean;
  } = {}
):string => {
  const { currency = 'INR', decimalPlaces = 2, compact = false, showSign = false, isExpense = false } = options;

  const displayValue = isExpense ? -Math.abs(value) : value;

  // Normalize negative zero to positive zero to avoid "-0.00" display
  let normalizedValue = displayValue;
  if (Object.is(normalizedValue, -0)) normalizedValue = 0;

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
    notation: compact ? 'compact' : 'standard',
    //signDisplay: showSign  ? 'always' : isExpense ? 'always' : 'auto',
    signDisplay: showSign ? 'always' : 'auto',
  }).format(normalizedValue);
};
