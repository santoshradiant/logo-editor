import React, { memo, useContext, useEffect } from 'react'
import PropTypes from 'prop-types'

import Grid from '@mui/material/Grid2'
import { LogoMaker } from '../../../logomaker'

import { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery'

import { goToWithHistory } from '@eig-builder/core-utils/helpers/go-to-helper'
import Text from '@eig-builder/module-localization'
import getLogoPlaceholders from 'core/logo-maker/images/placeholder'
import useAmountOfLogos from '../useAmountOfLogos'
import { useApplicationContext } from 'modules/application-config'
import LogoMarketingPage from './marketing-page'
import { useQuery } from '@tanstack/react-query'
import CircularProgress from '@mui/material/CircularProgress'
import { showError } from '@eig-builder/module-notification-bar-with-context/actions'
import { NotificationBarContext } from '@eig-builder/module-notification-bar-with-context'

import { useDeleteLogo } from 'hooks/useLogo'
import LogoClient from '../../../clients/logo.client'
import {
  GridContainer,
  HeaderContainer,
  HeaderGrid,
  TitleSection,
  HeaderTitle,
  HeaderSubtitle,
  CreateButton
} from '../views'
import { Box } from '@mui/material'
import { useNavigate } from 'react-router'

const MyLogosPage = () => {
  const { baseName, goToCreateLogo, shouldDisable } = useApplicationContext()
  const logosState = useQuery({ queryKey: 'logos', queryFn: LogoClient.getLogos })
  const navigate = useNavigate()
  const logosLength = logosState.data?.length

  // // 📍 We persist the amount, to show that amount of placeholders before api call.
  const amountOfLogosStorage = useAmountOfLogos(logosLength)

  const goToPreviewLogo = (id) => goToWithHistory(navigate,  baseName + '/editor/' + id + '/preview')
  const logos = logosState.data || getLogoPlaceholders(amountOfLogosStorage)
  const isMobile = useIsMobile()
  const { dispatch: barDispatch } = useContext(NotificationBarContext)

  const deleteLogo = useDeleteLogo()

  useEffect(() => {
    if (logosState.isError) {
      showError(<Text message='myLogos.error' />)(barDispatch)
    }
  }, [logosState.isError])

  if (logosState.isLoading || !logosState.isSuccess) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          py: 2
        }}
      >
        <CircularProgress  />
      </Box>
    )
  } else if (logosLength === 0) {
    return <LogoMarketingPage />
  }

  return (
    <div>
      {logosState.isSuccess && (
        <LogoMaker logos={logos} doNotSaveOnDownload>
          <>
            <HeaderContainer>
              <HeaderGrid container isMobile={isMobile}>
                <TitleSection>
                  <HeaderTitle>
                    <Text message='myLogos.myLogos' />
                  </HeaderTitle>
                  <HeaderSubtitle>
                    <Text message='myLogos.subtitle' />
                  </HeaderSubtitle>
                </TitleSection>
                <CreateButton
                  key='create new logo'
                  onClick={() => goToCreateLogo()}
                  dataElementId='create-button'
                  dataElementLabel='my-logos-create-button'
                  data-test-id='create-my-logo-button'
                  disabled={shouldDisable}
                >
                  <Text message='myLogos.createLogo' />
                </CreateButton>
              </HeaderGrid>
            </HeaderContainer>
          </>

          <GridContainer sx={{ flexGrow: 1, px: { xs: 1, md: 4 } }}>
              <LogoMaker.MyLogosGrid logos={logos} deleteLogo={deleteLogo.mutate} previewLogo={goToPreviewLogo} />
          </GridContainer>
        </LogoMaker>
      )}
    </div>
  )
}

export default memo(MyLogosPage)
