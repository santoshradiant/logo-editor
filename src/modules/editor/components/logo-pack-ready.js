import React from 'react'
import PropTypes from 'prop-types'
import Typography from '@mui/material/Typography'
import Text from '@eig-builder/module-localization'
import { Button } from '@mui/material'
import CloudDownloadIcon from '@mui/icons-material/CloudDownload'
import { DownloadPageContainer, FolderContainer } from '../views'
import LogoPreview from './logo-preview'

const LogoPackReady = ({ onDownload, logoInstance }) => {
  return (
    <DownloadPageContainer>
      <Typography variant='h2' className='pb-4'>
        <Text message='logoMaker.downloadPage.logoPackReady.title' />
      </Typography>
      <FolderContainer className='p-4 m-4'>
        <LogoPreview logoInstance={logoInstance} />
      </FolderContainer>
      <Typography variant='subtitle1' className='pb-4 pt-2'>
        <Text message='logoMaker.downloadPage.logoPackReady.subtitle' />
      </Typography>
      <Button
        startIcon={<CloudDownloadIcon />}
        labelPosition='after'
        onClick={onDownload}
        variant={'contained'}
        dataElementLabel='logo-download-button'
        dataElementId='logomaker-editor-logo-download-button'
      >
        <Text message='logoMaker.downloadPage.logoPackReady.saveButton' />
      </Button>
    </DownloadPageContainer>
  )
}

LogoPackReady.propTypes = {
  onDownload: PropTypes.func.isRequired,
  logoInstance: PropTypes.object.isRequired
}

export default LogoPackReady
