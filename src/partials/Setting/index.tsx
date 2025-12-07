import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import Modal from '@/components/Dialog'

import SettingContent from './Content'

export interface OAuthProps {
  visible?: boolean
  onClose?: () => void
}

export default function SettingModal({ visible, onClose }: OAuthProps) {
  const { t } = useTranslation()

  const handleClose = useCallback(() => {
    if (typeof onClose === 'function') {
      onClose()
    }
  }, [onClose])

  return (
    <Modal title={t('setting')} visible={visible} onClose={handleClose} width={512}>
      <SettingContent onClose={handleClose} />
    </Modal>
  )
}
