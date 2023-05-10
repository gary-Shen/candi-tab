import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';
import { Toaster } from 'react-hot-toast';

import useSettings from '@/hooks/useSettings';
import useStorage from '@/hooks/useStorage';

import type { SettingsContextType } from '../context/settings.context';
import SettingsContext from '../context/settings.context';

export default function SettingProvider({ children }: PropsWithChildren) {
  const [accessToken, setAccessToken] = useStorage('accessToken');
  const [settings, updateSettings] = useSettings();
  const value = useMemo(() => {
    return {
      updateSettings,
      settings,
      accessToken,
      updateAccessToken: setAccessToken,
    };
  }, [updateSettings, settings, accessToken, setAccessToken]);

  return (
    <SettingsContext.Provider value={value as NonNullable<SettingsContextType>}>
      <>
        {children}
        <Toaster position="bottom-right" reverseOrder={false} />
      </>
    </SettingsContext.Provider>
  );
}
