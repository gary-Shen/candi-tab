import { useMutation } from '@tanstack/react-query';

import { create, updateGist } from '@/service/gist';

import useStorage from './useStorage';

export const useGistUpdate = (gistId?: string) => {
  const [accessToken] = useStorage('accessToken');
  // @ts-ignore
  const mutation = useMutation(updateGist, {
    enabled: !!gistId && !!accessToken,
  });

  return mutation;
};

export const useGistCreation = (options?: any) => {
  const [accessToken] = useStorage('accessToken');
  const mutation = useMutation(create, {
    enabled: !!accessToken,
    select: (data: any) => data?.data,
    ...options,
  });

  return mutation;
};
