import styled from 'styled-components';

export const StyledMovableContainer = styled.div`
  .empty-block {
    height: 0px;
    background-color: var(--color-primary);
    outline: 1px solid var(--color-primary);
  }
`;

export const StyledShadow = styled.div<{
  visible: boolean;
}>`
  position: absolute;
  left: 0;
  top: 0;
  cursor: move;
  z-index: 999;

  button {
    width: 100%;
  }

  display: ${({ visible }) => (visible ? 'block' : 'none')};
`;
