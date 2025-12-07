import { useMutation } from '@tanstack/react-query'

import { create, updateGist } from '@/service/gist'

import useStorage from './useStorage'

export function useGistUpdate(gistId?: string) {
  const [accessToken] = useStorage('accessToken')
  // @ts-expect-error Library typings incomplete
  const mutation = useMutation(updateGist, {
    enabled: !!gistId && !!accessToken,
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
