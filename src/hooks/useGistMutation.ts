import { useMutation } from '@tanstack/react-query'

import { create, updateGist } from '@/service/gist'

import useStorage from './useStorage'

export function useGistUpdate(_gistId?: string) {
  useStorage('accessToken')
  const mutation = useMutation(updateGist, {
    retry: 5,
  })

  return mutation
}

export function useGistCreation(options?: any) {
  const [accessToken] = useStorage('accessToken')
  const mutation = useMutation(create, {
    enabled: !!accessToken,
    select: (data: any) => data?.data,
    ...options,
  })

  return mutation
}
