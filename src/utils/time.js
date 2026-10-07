export function formatDateTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleString();
}
