import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

import queryClient from '@/components/QueryProvider'
import { gistKeys } from '@/constant/queryKeys/gist'
import { destroyOctokit, fetchAll, fetchOne } from '@/service/gist'

function errHandler(err: any) {
  if (err.status === 401) {
    toast.dismiss()
    toast.error('Unauthorized! Please check your access token.')
    destroyOctokit()
  }
}

export function useGistAll(accessToken: string) {
  useEffect(() => {
    if (!accessToken) {
      queryClient.invalidateQueries(gistKeys.lists())
      queryClient.setQueryData(gistKeys.lists(), [])
    }
  }, [accessToken])

  const query = useQuery(gistKeys.lists(), fetchAll, {
    placeholderData: {} as any,
    enabled: !!accessToken,
    select: data => data?.data,
    onError: (err) => {
      errHandler(err)
      queryClient.setQueryData(gistKeys.lists(), [])
    },
  })

  return query
}

export function useGistOne(gistId: string | undefined, options?: any) {
  const query = useQuery(gistKeys.detail(gistId!), () => fetchOne({ gist_id: gistId! }), {
    enabled: !!gistId,
    placeholderData: {} as any,
    select: data => data?.data,
    onError: errHandler,
    ...options,
  })

  return query
}
