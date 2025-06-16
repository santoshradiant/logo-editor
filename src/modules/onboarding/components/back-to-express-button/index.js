import React, { useCallback } from 'react'
import { getUrl, siteNames } from '@eig-builder/core-utils/helpers/url-helper'

import Button from '@mui/material/Button'
import PropTypes from 'prop-types'
import Text from '@eig-builder/module-localization'
import get from 'lodash/get'
import { goToWithHistory } from '@eig-builder/core-utils/helpers/go-to-helper'
import { styled } from '@mui/material/styles'
import { useOnboardingContext } from 'modules/onboarding/context/onboarding-context'
import { getRuntimeConfig } from '@eig-builder/core-utils/helpers/runtime-config-helper'

import { useEditorContext } from 'logomaker/context/editor-context'

const StyledButton = styled(Button)`
  margin: 15px !important;
`

const BackToExpressButton = ({ siteId, ...other }) => {
  const { onboardingInfo } = useOnboardingContext()
  const editorContext = useEditorContext()
  const navigate = useNavigate()
  const siteIdUrl = siteId || get(onboardingInfo, 'site_id')
  const saveLogo = editorContext && editorContext.saveLogo
  const goBackToSiteEditor = useCallback(() => {
    const callback = () => {
      if (getRuntimeConfig()._brand === 'creativemail') {
        history.goBack()
      } else {
        goToWithHistory(navigate, getUrl(siteNames.RESPONSIVE_EDITOR, `/site/${siteIdUrl}?deeplink=logomaker`))
      }
    }
    if (saveLogo) {
      saveLogo(callback)
    } else {
      callback()
    }
  }, [saveLogo, history, siteIdUrl])

  return (
    <StyledButton onClick={goBackToSiteEditor} {...other}>
      <Text message='logomaker.backToExpressEditor' />
    </StyledButton>
  )
}

BackToExpressButton.propTypes = {
  siteId: PropTypes.number
}

export default BackToExpressButton
