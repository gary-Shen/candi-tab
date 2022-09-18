import { useCallback, useEffect, useState } from 'react';

import * as storage from './storage';

export default function useStorage(key: string) {
  const [value, setValue] = useState<any>();

  useEffect(() => {
    try {
      storage.get(key).then((result) => {
        setValue(result);
      });
    } catch (err) {
      // eslint-disable-next-line
      console.warn(err);
      setValue(undefined);
    }
  }, [key]);

  const handleUpdate = useCallback(
    (payload: any) => {
      try {
        setValue(payload);
        storage.set(key, payload);
      } catch (err) {
        // eslint-disable-next-line
        console.warn(err);
      }
    },
    [key],
  );

  return [value, handleUpdate];
}
