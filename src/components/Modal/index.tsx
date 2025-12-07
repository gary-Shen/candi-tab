import Dialog from '@reach/dialog'
import { X } from 'lucide-react'
import classNames from 'classnames'
import React from 'react'
import IconButton from '../IconButton'

export interface ModalProps {
  visible?: boolean
  onClose: () => void
  children: React.ReactNode
  style?: React.CSSProperties
  showCloseButton?: boolean
  className?: string
}

function Modal({ visible, onClose, children, style, showCloseButton = true, className }: ModalProps) {
  return (
    <>
      <style>
        {`
        [data-reach-dialog-overlay] {
          z-index: 2;
        }
      `}
      </style>
      <Dialog
        isOpen={visible}
        onDismiss={onClose}
        style={style}
        className={classNames(
          'relative shadow-default bg-modal-body p-0 border border-default rounded-[var(--border-radius)]',
          className,
        )}
      >
        {showCloseButton && (
          <IconButton className="absolute z-[9] top-[6px] right-[6px]" onClick={onClose}>
            <X />
          </IconButton>
        )}
        {visible && children}
      </Dialog>
    </>
  )
}

export interface ModalHeaderProps {
  children: React.ReactNode
}

function ModalHeader({ children }: ModalHeaderProps) {
  return (
    <div
      className="font-bold p-4 bg-modal-header border-b border-default rounded-t-[calc(var(--border-radius)-1px)]"
      style={{ overflowWrap: 'break-word' }}
    >
      {children}
    </div>
  )
}

export interface ModalBodyProps {
  children: React.ReactNode
  className?: string
}

function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div
      className={classNames('p-card-x bg-modal-body rounded-b-[calc(var(--border-radius)-1px)]', className)}
    >
      {children}
    </div>
  )
}

export interface ModalFooterProps {
  children: React.ReactNode
}

function ModalFooter({ children }: ModalFooterProps) {
  return (
    <div className="flex justify-end p-card-x border-t border-default bg-modal-header rounded-b-[calc(var(--border-radius)-1px)] space-x-4">
      {children}
    </div>
  )
}

export default Object.assign(Modal, {
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
})
