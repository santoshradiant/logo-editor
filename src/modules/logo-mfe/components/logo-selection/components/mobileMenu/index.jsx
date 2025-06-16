import React from 'react'
import PropTypes from 'prop-types'

import Text from '@eig-builder/module-localization'
import Typography from '@mui/material/Typography'

import Layout from './mobileMenu.views'

const MobileMenu = ({ logoState, setOpen }) => {
  const logoInfo = logoState.text
  const isSloganOn = logoInfo.slogan.length
  const isSloganChecked = <Text message={`logoMFE.logoSelection.mobileMenu.${isSloganOn ? 'on' : 'off'}`} />
  const isIconChecked = <Text message={`logoMFE.logoSelection.mobileMenu.${logoInfo.showHideSymbol ? 'on' : 'off'}`} />

  return (
    <Layout>
      <Typography variant='h5'>
        <Text message='logoMFE.brandDetails' />
      </Typography>
      <Layout.InfoContainer>
        <Layout.Button type='link' onClick={() => setOpen(true)}>
          <Text message='logoMFE.logoSelection.mobileMenu.changeDetails' />
        </Layout.Button>
        <Typography variant='h5'>{logoInfo.brandName}</Typography>
        <Typography variant='h5'>{logoInfo.description}</Typography>
        <Layout.SwitchContainer>
          <Typography variant='h5'>
            <Text message='logoMFE.logoSelection.mobileMenu.icon' />
          </Typography>
          <Typography variant='h5'>{isIconChecked}</Typography>
          <Typography variant='h5'>
            <Text message='logoMFE.logoSelection.mobileMenu.slogan' />
          </Typography>
          <Typography variant='h5'>{isSloganChecked}</Typography>
        </Layout.SwitchContainer>
        {isSloganOn > 0 && <Typography variant='h5'>{logoInfo.slogan}</Typography>}
      </Layout.InfoContainer>
    </Layout>
  )
}

MobileMenu.propTypes = {
  logoState: PropTypes.object,
  setOpen: PropTypes.func
}

export default MobileMenu
