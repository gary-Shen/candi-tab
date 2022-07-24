export async function fetchToken(uuid) {
  return fetch('https://candi-tab.vercel.app/api/github?uuid=' + uuid);
}
