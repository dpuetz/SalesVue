export function useDate() {
  //Feb 1, 2029
  const formatDate = (val: string | null): string => {
    if (!val) return '—';
    const datePart = val.includes('T') ? val.split('T')[0] : val;
    return new Date(datePart + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateShort = (val: string | null): string => {
    //2/1/2029
    if (!val) return '—';
    const datePart = val.includes('T') ? val.split('T')[0] : val;
    return new Date(datePart + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDatePadded = (val: string | null): string => {
    //02/01/2029
    if (!val) return '—';
    const datePart = val.includes('T') ? val.split('T')[0] : val;
    return new Date(datePart + 'T00:00:00').toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  return { formatDate, formatDateShort, formatDatePadded };
}
