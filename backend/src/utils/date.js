const PKT_OFFSET_MS = 5 * 60 * 60 * 1000; // UTC+5 (Pakistan Standard Time)

// Returns a Date object shifted to PKT so that UTC methods (.getUTCFullYear etc.) return PKT values
function pktNow() {
  return new Date(Date.now() + PKT_OFFSET_MS);
}

// Today's date in PKT as YYYY-MM-DD
function todayPKT() {
  return pktNow().toISOString().split('T')[0];
}

// First day of the current PKT month as YYYY-MM-DD
function firstOfMonthPKT() {
  const now = pktNow();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}-01`;
}

// Date N days from now in PKT as YYYY-MM-DD
function daysFromNowPKT(n) {
  return new Date(Date.now() + PKT_OFFSET_MS + n * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0];
}

module.exports = { pktNow, todayPKT, firstOfMonthPKT, daysFromNowPKT };
