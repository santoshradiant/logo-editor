import React, { useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import PreviewLogoContent from './preview-logo-content'
import Typography from '@mui/material/Typography'
import Text from '@eig-builder/module-localization'
import { LogoMaker } from '../../../logomaker'
import '../lang'
import { DownloadPageContainer } from 'modules/editor/views'
import ErrorDialog from 'logomaker/components/error-dialog'
import { useNavigate } from 'react-router'

const parseBool = bool => {
  switch (typeof bool) {
    case 'string':
      return bool.toLowerCase() === 'true'
    case 'boolean':
      return bool
    default:
      return !!bool
  }
}

const PreparingLogoPack = ({ logoInstance, limitations, onPrepared }) => {
  const configs = useMemo(() => {
    const limitationsList = Object.entries(limitations ?? {})
      .filter(([key, values]) => parseBool(values?.value) === false || key === 'logobuilder_unlimited_account')
      .flatMap(([key]) => [key])
    return logoInstance.getConfigs(false, limitationsList)
  }, [limitations, logoInstance])

  const navigate = useNavigate()
  const goBack = () => navigate(-1)

  useEffect(() => {
    if (configs == null || configs.length === 0) {
      return
    }

    logoInstance.createLayout()
    logoInstance.updateLayout()
    const interval = setInterval(() => {
      if (logoInstance.checkAllResourcesLoaded()) {
        logoInstance.updateLayout(false, () => {
          logoInstance.createLogoZip(configs, (blob, zipName) => {
            onPrepared({ blob, zipName })
          })
        })
        clearInterval(interval)
      }
    }, 100)
  }, [configs])

  return (
    <DownloadPageContainer>
      <Typography variant='h2'>
        <Text message='logoMaker.downloadPage.preparingLogoPack.title' />
      </Typography>
      <PreviewLogoContent>
        <LogoMaker.LogoArea logoInstance={logoInstance} />
      </PreviewLogoContent>
      <Typography variant='subtitle1'>
        <Text message='logoMaker.downloadPage.preparingLogoPack.subtitle' />
      </Typography>
      <ErrorDialog
        open={configs.length === 0}
        handleCancel={goBack}
        message={<Text message='logoMaker.downloadPage.preparingLogoPack.notAllowed' />}
      />
    </DownloadPageContainer>
  )
}

PreparingLogoPack.propTypes = {
  logoInstance: PropTypes.object.isRequired,
  limitations: PropTypes.object.isRequired,
  onPrepared: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
}

export default PreparingLogoPack
