export function fetchToken({ queryKey }) {
  const [, uuid] = queryKey;
  return fetch('https://candi-tab.vercel.app/api/token?uuid=' + uuid);
}
