import NavigationWrapper, { Navigation, PageContent } from '@eig-builder/module-navigation'
import React, { memo, useEffect } from 'react'

import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import PropTypes from 'prop-types'
import { goToWithHistory } from '@eig-builder/core-utils/helpers/go-to-helper'
import { useNavigate, useParams } from 'react-router'
import TemporaryLogoClient from '../../../clients/temporary-logo.client'

/*
 * The TransferPage is an intermediate allocation page of temp logo's.
 *
 * When a user creates an logo in the no-account flow. The logo is saved temporary
 * then after signup redirects over here. This page then handles the logo allocation to
 * the user's just created account.
 */
const TransferPage = ({}) => {
  const { logoId } = useParams()

  const [transferredLogo, setTransferredLogo] = React.useState()
  const navigate = useNavigate()

  // 📍 Call the backend to transfer the logo
  useEffect(() => {
    if (logoId && logoId !== '') {
      TemporaryLogoClient.transferLogo(logoId)
        .then(setTransferredLogo)
        .catch(() => {
          goToWithHistory(navigate, `/logo`)
        })
    }
  }, [logoId])

  if (transferredLogo != null) {
    goToWithHistory(navigate, `/logo/editor/${transferredLogo.id}`)
  }

  return (
    <NavigationWrapper closeFocusView={() => navigate(-1)}>
      <Navigation.DetailBar>
        <Navigation.LeftAlign>
          <Navigation.BackButton paddingRight='8px' />
        </Navigation.LeftAlign>
      </Navigation.DetailBar>
      <PageContent>
        <Box sx={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
          <CircularProgress />
        </Box>
      </PageContent>
    </NavigationWrapper>
  )
}

TransferPage.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
}

export default memo(TransferPage)
