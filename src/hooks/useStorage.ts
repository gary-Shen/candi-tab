import { useCallback, useEffect, useState } from 'react'

import * as storage from './storage'

export default function useStorage(key: string) {
  const [value, setValue] = useState<any>()

  useEffect(() => {
    try {
      storage.get(key).then((result) => {
        setValue(result)
      })
    }
    catch (err) {
      console.warn(err)
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect, react-hooks/set-state-in-effect
      setValue(undefined)
    }
  }, [key])

  const handleUpdate = useCallback(
    (payload: any) => {
      try {
        setValue(payload)
        storage.set(key, payload)
      }
      catch (err) {
        console.warn(err)
      }
    },
    [key],
  )

  return [value, handleUpdate]
}
