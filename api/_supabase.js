const SUPABASE_URL = "https://bnlymzocydhmpuzmiwlz.supabase.co";
const SUPABASE_KEY = "sb_publishable_K9N6nBr03U4ZgtX1cFdERQ_1uppv6uO";

export async function sbQuery(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${SUPABASE_URL}/rest/v1/${endpoint.replace(/^\//, "")}`;
  const headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": options.prefer || "return=representation",
    ...(options.headers || {})
  };
  return fetch(url, { ...options, headers });
}