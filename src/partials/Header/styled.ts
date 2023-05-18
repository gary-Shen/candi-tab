import { MenuItem, MenuList } from '@reach/menu-button';
import styled from 'styled-components';

export const StyledMenuList = styled(MenuList)`
  background-color: var(--card-header-bg);
  padding: 8px 0;
  border-radius: 3px;
  color: var(--font-color);
  box-shadow: rgb(15 15 15 / 5%) 0px 0px 0px 1px, rgb(15 15 15 / 10%) 0px 3px 6px, rgb(15 15 15 / 20%) 0px 9px 24px;
`;

export const StyledMenuItem = styled(MenuItem)`
  cursor: pointer;
  padding: 4px 16px;
  transition: all 0.2s;
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

export const StyledHeader = styled.div`
  position: fixed;
  display: flex;
  top: 16px;
  right: 16px;
  z-index: 2;
`;
