import {
  Tab as RTab,
  TabList as RTabList,
  TabPanel as RTabPanel,
  TabPanels as RTabPanels,
  Tabs as RTabs,
} from '@reach/tabs';
import styled from 'styled-components';

export const Tab = styled(RTab)`
  padding: 0.25em 1.5em;
  border: 0;
  border-bottom: 2px solid transparent;
  color: var(--font-color);
  background: transparent;

  &[data-selected] {
    font-weight: bold;
    border-bottom: 3px solid var(--primary-color);
  }
`;
export const TabList = styled(RTabList)`
  background: transparent;
`;
export const TabPanel = styled(RTabPanel)``;
export const TabPanels = styled(RTabPanels)``;
export const Tabs = styled(RTabs)``;
