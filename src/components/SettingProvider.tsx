import useSettings from '@/hooks/useSettings';
import useStorage from '@/hooks/useStorage';
import { PropsWithChildren, useEffect, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';

import type { SettingsContextType } from '../context/settings.context';
import SettingsContext from '../context/settings.context';

const notify = () => toast('Here is your toast.');

export default function SettingProvider({ children }: PropsWithChildren) {
  const [accessToken, setAccessToken] = useStorage('accessToken');
  const [settings, updateSettings, loading] = useSettings();
  const value = useMemo(() => {
    return {
      updateSettings,
      settings,
      accessToken,
      updateAccessToken: setAccessToken,
    };
  }, [updateSettings, settings, accessToken, setAccessToken]);

  useEffect(() => {
    if (loading) {
      notify();
    }
  }, [loading]);

  return (
    <SettingsContext.Provider value={value as NonNullable<SettingsContextType>}>
      <>
        {children}
        <Toaster position="bottom-right" reverseOrder={false} />
      </>
    </SettingsContext.Provider>
  );
}
