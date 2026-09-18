export function publishedJobs(records) {
  return records.filter(j => !j._id.startsWith('drafts.') && j.publishedAt)
    .sort((a,b)=>Number(Boolean(a.legacyId))-Number(Boolean(b.legacyId))||
      (a.legacyId&&b.legacyId?(a.legacyOrder??99999)-(b.legacyOrder??99999):b.publishedAt.localeCompare(a.publishedAt))||a._id.localeCompare(b._id));
}
export function recentJobs(records){return publishedJobs(records).slice(0,3)}
export function serviceJobs(records,service){return publishedJobs(records).filter(j=>j.serviceType===service)}
export function cityJobs(records,city){return publishedJobs(records).filter(j=>j.city===city)}
