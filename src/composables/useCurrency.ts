export function useCurrency() {
  const formatUSD = (value: number): string =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  return {
    formatUSD,
  };
}
