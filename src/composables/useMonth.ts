export function useMonth() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const monthName = (m: number): string => {
    const name = months[m - 1];
    return name ? name : '';
  };

  return { monthName };
}
