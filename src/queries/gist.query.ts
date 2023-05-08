import { useMutation, useQuery } from '@tanstack/react-query';

import type { GistPayload } from '@/service/gist';
import { create, fetchOne } from '@/service/gist';
import type { Setting } from '@/types/setting.type';

interface GistQueryParams {
  gistId?: string;
}

export const useGistQuery = (state: GistQueryParams, options?: any) => {
  const { gistId } = state;
  const query = useQuery(['gist', gistId], () => fetchOne(gistId!), {
    enabled: !!gistId,
    placeholderData: {} as any,
    select: (data) => data?.data,
    ...options,
  });
  return query;
};

interface GistMutationParams {
  gist: GistPayload;
  settings: Setting;
  onSuccess: () => void;
  onError: () => void;
}

export const useGistCreation = ({ gist, settings, onSuccess, onError }: GistMutationParams) => {
  const { mutate, isLoading, error } = useMutation(() => create({ gist, settings }), {
    onSuccess,
    onError,
  });
  return { mutate, isLoading, error };
};
