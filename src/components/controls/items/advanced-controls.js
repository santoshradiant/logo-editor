import React from 'react'
import PropTypes from 'prop-types'

import Text from '@eig-builder/module-localization'
import useToggle from 'hooks/useToggle'
import Button from '@mui/material/Button'

const AdvancedControls = ({ children }) => {
  const [showAdvancedControls, toggleAdvancedControls] = useToggle(false)

  return (
    <>
      <Button variant={showAdvancedControls ? 'outlined' : 'contained'} onClick={toggleAdvancedControls}>
        <Text message='logomaker.advancedControls' />
      </Button>
      {showAdvancedControls && children}
    </>
  )
}

AdvancedControls.propTypes = {
  children: PropTypes.node.isRequired
}

export default AdvancedControls
