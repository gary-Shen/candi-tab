import { BiX } from '@react-icons/all-files/bi/BiX';
import React from 'react';
import { createGlobalStyle } from 'styled-components';

import { CloseButton, StyledModal, StyledModalBody, StyledModalFooter, StyledModalHeader } from './styled';

const GlobalStyle = createGlobalStyle`
  [data-reach-dialog-overlay] {
    z-index: 2;
  }
`;

export interface ModalProps {
  visible?: boolean;
  onClose: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  showCloseButton?: boolean;
  className?: string;
}

function Modal({ visible, onClose, children, style, showCloseButton = true, className }: ModalProps) {
  return (
    <StyledModal isOpen={visible} onDismiss={onClose} style={style} className={className}>
      {showCloseButton && (
        <CloseButton onClick={onClose}>
          <BiX />
        </CloseButton>
      )}
      {visible && children}
      <GlobalStyle />
    </StyledModal>
  );
}

export interface ModalHeaderProps {
  children: React.ReactNode;
}

function ModalHeader({ children }: ModalHeaderProps) {
  return <StyledModalHeader style={{ overflowWrap: 'break-word' }}>{children}</StyledModalHeader>;
}

export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

function ModalBody({ children, className }: ModalBodyProps) {
  return <StyledModalBody className={className}>{children}</StyledModalBody>;
}

export interface ModalFooterProps {
  children: React.ReactNode;
}

function ModalFooter({ children }: ModalFooterProps) {
  return <StyledModalFooter>{children}</StyledModalFooter>;
}

export default Object.assign(Modal, {
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
});
