import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import get from 'lodash/get'
import LogoMakerContext from '../context/editor-context'
import { useApplicationContext } from 'modules/application-config/index'
import { goToWithHistory } from '@eig-builder/core-utils/helpers/go-to-helper'
import { DataElementLocations } from '@eig-builder/core-utils/helpers/tagging-helper'
import IconButton from '@mui/material/IconButton'
import SaveDialog from './save-logo-dialog'
import HomeIcon from '@mui/icons-material/Home'
import useLimitation from '@eig-builder/core-utils/hooks/useLimitation'
import { getHomeUrl, isHostedBrand } from 'modules/application-config/features'
import { AppSetupContext } from '@eig-builder/module-app-setup'
import { useNavigate } from 'react-router'

const BackButton = ({ onClick, icon }) => {
  const { isOPN } = useContext(AppSetupContext)
  const logoMakerContext = useContext(LogoMakerContext)
  const { baseName } = useApplicationContext()
  const [openSaveDialog, setOpenSaveDialog] = useState(false)
  const [limitationResponse] = useLimitation('controlpanel')
  const navigate = useNavigate()

  const finalRedirect = () => {
    const allNavLimited = get(limitationResponse.data, 'limitations.nav_all.value')
    const partnerRedirectUrl = get(limitationResponse.data, 'limitations.top_shell.settings.redirect_url')
    const partnerIntegration = allNavLimited && partnerRedirectUrl
    const wasOpenedFromEE = JSON.parse(window.localStorage.getItem('CREATE_OPENED_FROM_EE'))

    if (isOPN) {
      return goToWithHistory(navigate, baseName + '/')
    }
    // this will also cover jarvis brands (or any brand with partnerID > 100)
    if (isHostedBrand()) {
      return goToWithHistory(navigate, getHomeUrl())
    }
    if (wasOpenedFromEE || !partnerIntegration) {
      return goToWithHistory(navigate, baseName + '/')
    }
    // ctct is only using this limitation redirect url.
    window.location.assign(partnerRedirectUrl)
  }

  const saveLogo = () => {
    logoMakerContext.saveLogo(finalRedirect)
  }

  const goBack = () => {
    if (logoMakerContext.unSavedProgress) {
      setOpenSaveDialog(true)
    } else {
      finalRedirect()
    }
  }

  return (
    <>
      <SaveDialog
        open={openSaveDialog}
        handleCancel={() => setOpenSaveDialog(false)}
        handleNo={finalRedirect}
        handleYes={saveLogo}
      />
      {!limitationResponse?.isLoading && limitationResponse?.isSuccess && (
        <IconButton
          onClick={onClick || goBack}
          style={{ marginLeft: 8 }}
          dataElementLocation={DataElementLocations.HEADER}
          dataElementId='icon'
          dataElementLabel='navigation-logomaker-back'
        >
          {icon || <HomeIcon />}
        </IconButton>
      )}
    </>
  )
}

BackButton.propTypes = {
  history: PropTypes.object.isRequired,
  onClick: PropTypes.func
}

export default BackButton
