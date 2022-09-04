import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { BiX } from 'react-icons/bi';
import { Dialog } from '@reach/dialog';

import '@reach/dialog/styles.css';

import IconButton from '../IconButton';

const GlobalStyle = createGlobalStyle`
  [data-reach-dialog-overlay] {
    z-index: 2;
  }
`;

const StyledModal = styled(Dialog)`
  position: relative;
  border-radius: 3px;
  box-shadow: rgb(15 15 15 / 5%) 0px 0px 0px 1px, rgb(15 15 15 / 10%) 0px 3px 6px, rgb(15 15 15 / 20%) 0px 9px 24px;
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  z-index: 9;
  top: 16px;
  right: 16px;
`;

export interface ModalProps {
  visible?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ visible, onClose, children }: ModalProps) {
  return (
    <StyledModal isOpen={visible} onDismiss={onClose}>
      <CloseButton onClick={onClose}>
        <BiX />
      </CloseButton>
      {visible && children}
      <GlobalStyle />
    </StyledModal>
  );
}

export interface ModalHeaderProps {
  children: React.ReactNode;
}

Modal.Header = function ModalHeader({ children }: ModalHeaderProps) {
  return <h3 style={{ overflowWrap: 'break-word' }}>{children}</h3>;
};

export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

Modal.Body = function ModalBody({ children, className }: ModalBodyProps) {
  return <div className={className}>{children}</div>;
};

const StyledFooter = styled.div`
  display: flex;
  justify-content: flex-end;

  & > * {
    margin-right: 16px;
    &:last-child {
      margin-right: 0;
    }
  }
`;

export interface ModalFooterProps {
  children: React.ReactNode;
}

Modal.Footer = function ModalFooter({ children }: ModalFooterProps) {
  return <StyledFooter>{children}</StyledFooter>;
};
