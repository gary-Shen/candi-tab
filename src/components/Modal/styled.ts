import Dialog from '@reach/dialog';
import styled from 'styled-components';

import IconButton from '../IconButton';

export const StyledModal = styled(Dialog)`
  position: relative;
  box-shadow: var(--box-shadow);
  background-color: var(--modal-body-bg);
  padding: 0;
  border: var(--border-color) 1px solid;
  border-radius: var(--border-radius);
`;

export const StyledModalHeader = styled.div`
  font-weight: bold;
  padding: 1rem;
  background-color: var(--modal-header-bg);
  border-bottom: var(--border-color) 1px solid;
  border-radius: calc(var(--border-radius) - 1px) calc(var(--border-radius) - 1px) 0 0;
`;

export const StyledModalBody = styled.div`
  padding: var(--card-padding-x);
  background-color: var(--modal-body-bg);
  border-radius: 0 0 calc(var(--border-radius) - 1px) calc(var(--border-radius) - 1px);
`;

export const StyledModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: var(--card-padding-x);
  border-top: var(--border-color) 1px solid;
  background-color: var(--modal-header-bg);
  border-radius: 0 0 calc(var(--border-radius) - 1px) calc(var(--border-radius) - 1px);

  & > * {
    margin-right: 1rem;
    &:last-child {
      margin-right: 0;
    }
  }
`;

export const CloseButton = styled(IconButton)`
  position: absolute;
  z-index: 9;
  top: 6px;
  right: 6px;
`;
