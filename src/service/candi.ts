import type { Query } from '@tanstack/react-query';

export function fetchToken({ queryKey }: Query) {
  const [, uuid] = queryKey;
  return fetch('https://candi-tab.vercel.app/api/token?uuid=' + uuid);
}
