export function displayJobTitle(job) {
  const fallback = job.equipment || 'Completed installation';
  if (!job.title) return fallback;
  const city = String(job.city || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const withoutCity = city
    ? job.title.replace(new RegExp(`^\\s*${city}\\s*(?:[-–—:]\\s*)?`, 'i'), '')
    : job.title;
  return withoutCity.trim() || fallback;
}
