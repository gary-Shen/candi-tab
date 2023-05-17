import { useQuery } from '@tanstack/react-query';

import { fetchAll, fetchOne } from '@/service/gist';
import { gistKeys } from '@/constant/queryKeys/gist';

export const useGistAll = (options?: any) => {
  const query = useQuery(gistKeys.lists(), fetchAll, {
    placeholderData: {} as any,
    select: (data) => data?.data,
    onError(err) {
      console.log(err);
    },
    ...options,
  });

  return query;
};

export const useGistOne = (gistId: string | undefined, options?: any) => {
  const query = useQuery(gistKeys.detail(gistId!), () => fetchOne({ gist_id: gistId! }), {
    enabled: !!gistId,
    placeholderData: {} as any,
    select: (data) => data?.data,
    ...options,
  });

  return query;
};
