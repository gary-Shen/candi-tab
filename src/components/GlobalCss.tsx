import useSettings from '@/hooks/useSettings';
import _ from 'lodash';

import GlobalCSSVariables from '@/style/GlobalCSSVariables';

import themes from '../themes';

export default function GlobalCss() {
  const [settings] = useSettings();
  const themeSolution = _.get(settings, 'theme.solution');
  const themeVariables = _.get(themes, themeSolution!);

  return <GlobalCSSVariables theme={themeVariables} />;
}
