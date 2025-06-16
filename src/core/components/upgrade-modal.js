import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Modal from '@eig-builder/module-modal'

import Button from '@mui/material/Button'
import Text from '@eig-builder/module-localization'

import { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery'

import { getUpsellUrl } from 'components/opn-upsell'

import './../../logomaker/components/lang'

const UpgradeModal = ({ open, onClose }) => {
  const [hasSingleProduct, setHasSingleProduct] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    const subscription = window?.IANavFeatureFlag?.subscribe({
      next: (newState) => {
        setHasSingleProduct(newState?.productsInfo?.length <= 1)
      },
      error: (error) => {
        console.error('Error:', error)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])
  return (
    <Modal open={open} onClose={onClose} fullScreen={isMobile}>
      <Modal.Header>
        <Modal.Alignment alignSelf='center'>
          <Modal.Header.Title title={<Text message='logoBuilder.upgradeModal.opn.title' />} />
        </Modal.Alignment>
        <Modal.Alignment rightAligned>
          <Modal.Header.Close />
        </Modal.Alignment>
      </Modal.Header>
      <Modal.Content>
        <Text message='logoBuilder.upgradeModal.opn.content' />
      </Modal.Content>
      <Modal.Footer>
        <Modal.Alignment rightAligned>
          <a href={getUpsellUrl(hasSingleProduct)}>
            <Button onClick={onClose} variant='contained' color='primary'>
              <Text message='logoBuilder.upgradeModal.opn.button' />
            </Button>
          </a>
        </Modal.Alignment>
      </Modal.Footer>
    </Modal>
  )
}

UpgradeModal.propTypes = {
  onClose: PropTypes.any,
  open: PropTypes.any
}

export default UpgradeModal
