import { Menu, MenuButton as MButton, MenuItem as MItem, MenuList as MList } from '@reach/menu-button';
import styled from 'styled-components';

const StyledMenu = styled(Menu)``;

export const MenuItem = styled(MItem)`
  cursor: pointer;
  padding: 0.25rem 1rem;
  &:hover {
    color: var(--menu-active-color);
    background-color: var(--menu-active-bg);
  }
`;

export const MenuButton = styled(MButton)``;

export const MenuList = styled(MList)`
  background-color: var(--modal-body-bg);
  padding: 0.5rem 0;
  border-radius: var(--border-radius);
  color: var(--font-color);
  box-shadow: var(--box-shadow);
  border: 1px solid var(--border-color);
`;

export default StyledMenu;
