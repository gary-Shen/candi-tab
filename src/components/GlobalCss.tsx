import _ from 'lodash';
import React, { useContext } from 'react';

import GlobalCSSVariables from '@/style/GlobalCSSVariables';
import settingsContext from '@/context/settings.context';

import themes from '../themes';

export default function GlobalCss({ children }: React.PropsWithChildren) {
  const { settings } = useContext(settingsContext);
  const themeSolution = _.get(settings, 'theme.solution');
  const themeVariables = _.get(themes, themeSolution!);

  return (
    <>
      <GlobalCSSVariables theme={themeVariables} />
      {children}
    </>
  );
}
