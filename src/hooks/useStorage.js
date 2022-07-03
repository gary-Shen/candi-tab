import { useCallback, useEffect, useState } from 'react';

import * as storage from './storage';

export default function useStorage(key) {
  const [value, setValue] = useState();

  useEffect(() => {
    try {
      storage.get(key).then((result) => {
        setValue(result);
      });
    } catch (err) {
      console.warn(err);
      setValue(undefined);
    }
  }, [key]);

  const handleUpdate = useCallback(
    (payload) => {
      try {
        setValue(payload);
        storage.set(key, payload);
      } catch (err) {
        console.warn(err);
      }
    },
    [key],
  );

  return [value, handleUpdate];
}
