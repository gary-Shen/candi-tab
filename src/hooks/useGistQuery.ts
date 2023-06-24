import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { fetchAll, fetchOne } from '@/service/gist';
import { gistKeys } from '@/constant/queryKeys/gist';
import queryClient from '@/components/QueryProvider';

export const useGistAll = (accessToken: string) => {
  useEffect(() => {
    if (!accessToken) {
      queryClient.invalidateQueries(gistKeys.lists());
      queryClient.setQueryData(gistKeys.lists(), []);
    }
  }, [accessToken]);

  const query = useQuery(gistKeys.lists(), fetchAll, {
    placeholderData: {} as any,
    enabled: !!accessToken,
    select: (data) => data?.data,
    onError() {
      queryClient.setQueryData(gistKeys.lists(), []);
    },
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
