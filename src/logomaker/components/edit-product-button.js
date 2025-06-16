import React, { memo, useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import Button from '@mui/material/Button'
import { useEditorContext } from '../context/editor-context'
import { DataElementLocations } from '@eig-builder/core-utils/helpers/tagging-helper'

import Text from '@eig-builder/module-localization'
import '../lang'

const EditProductButton = ({ isInParcel }) => {
  const { productURL } = useEditorContext()
  const [noSelectedProduct, setNoSelectedProduct] = useState(true)

  useEffect(() => {
    if (productURL?.length > 1) setNoSelectedProduct(false)
  }, [productURL])

  return (
    <>
      <Button
        disabled={noSelectedProduct}
        href={productURL}
        target='_blank'
        variant={isInParcel ? 'outlined' : 'contained'}
        dataElementLocation={DataElementLocations.HEADER}
        dataElementLabel='edit-product-button'
        dataElementId='logomaker-editor-edit-product-button'
      >
        <Text message='logomakerEditor.buyMerch' />
      </Button>
    </>
  )
}

EditProductButton.defaultProps = {
  isInParcel: false
}

EditProductButton.propTypes = {
  isInParcel: PropTypes.bool
}

export default memo(EditProductButton)
