import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { styled } from '@mui/material/styles'

import { useNavigate, useParams, withRouter } from 'react-router'
import { Spring } from 'react-spring/renderprops'

import { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery'

import isEmpty from 'lodash/isEmpty'

import Text from '@eig-builder/module-localization'
import './lang'
// Helpers
import { goToWithHistory } from '@eig-builder/core-utils/helpers/go-to-helper'
import PageHeader from '@eig-builder/compositions-page-header'
import Grid from 'core/components/grid'

import { useApplicationContext } from 'modules/application-config/index'
import { useSaveLogo } from 'hooks/useLogo'
import useGetOnboardingInfo from 'modules/onboarding/hooks/use-get-onboarding-info'

const StyledContainer = styled('div')`
  width: 51vw;
  min-width: 1280px;

  @media screen and (max-width: 1280px) {
    width: 100%;
    min-width: 100%;
  }

  margin: 0 auto;
`

const TemplateSelection = ({ hideHeader, match, maxItems }) => {
  const params = useParams()
  const navigate = useNavigate()
  const onboardingInfo = useGetOnboardingInfo(match.params.id)

  const saveLogo = useSaveLogo()

  const [loading, setLoading] = useState(false)
  const [domRect, setDomRect] = useState({
    height: 0,
    width: 0,
    left: 0,
    top: 0
  })
  const [saveImage, setSaveImage] = useState()
  const { baseName } = useApplicationContext()

  const PNG_WIDTH = 1200
  const PNG_HEIGHT = 800

  // upon hard refresh get the data since the redux state is cleared
  const { companyName, slogan, id } = match.params

  const selectTemplate = domRef => {
    const rect = domRef.current.getBoundingClientRect()
    setDomRect(rect)

    setLoading(true)
    const instance = domRef && domRef.current && domRef.current.dataLogoInstance
    if (instance) {
      const details = {
        name: instance.templateData.text.brandName,
        svg: instance.getSVG(),
        logo: JSON.stringify(instance.templateData)
      }
      instance.getPngPromise(PNG_WIDTH, PNG_HEIGHT).then(pngData => {
        setSaveImage(pngData)
        details.preview_image_data = pngData

        saveLogo
          .mutateAsync(details)
          .then(({ id }) => goToWithHistory(navigate, `${baseName}/editor/${id}/name` + window.location.search))
      })
    }
  }

  const isMobile = useIsMobile()

  const left = isMobile
    ? window.innerWidth / 2 - (window.innerWidth - 38) / 2
    : window.innerWidth / 2 - domRect.width / 2 + 125 // navbar width / 2 - padding * 2

  const top = isMobile ? 100 : window.innerHeight / 2 - domRect.height / 2

  // upon hard refresh and we are coming from EE
  // get data and wait for it to render
  if (id && (onboardingInfo.isFetching || isEmpty(onboardingInfo.data))) {
    return null
  }

  // normal flow
  return (
    <StyledContainer className='pt-4'>
      {!hideHeader && (
        <div className='pl-4 pr-4'>
          <PageHeader
            title={<Text message='modules.onboarding.containers.selection.title' />}
            subtitle={<Text message='modules.onboarding.containers.selection.subtitle' />}
          />
        </div>
      )}
      {isMobile && loading && (
        <React.Fragment>
          <Spring
            from={domRect}
            to={{
              height: isMobile ? 239 : domRect.height,
              width: isMobile ? window.innerWidth - 38 : domRect.width,
              top: top,
              left: left
            }}
          >
            {prop => (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'white',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center center',
                  backgroundImage: `url(${saveImage})`
                }}
              />
            )}
          </Spring>
        </React.Fragment>
      )}
      <Grid
        onSelect={selectTemplate}
        templateData={{
          text: {
            brandName: decodeURIComponent(companyName),
            slogan: slogan ? decodeURIComponent(slogan) : null
          },
          colors: {
            palette: !isEmpty(onboardingInfo.data) ? onboardingInfo.data.colors : []
          }
        }}
        maxItems={maxItems}
        showLoader
      />
    </StyledContainer>
  )
}
TemplateSelection.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object.isRequired,
  hideHeader: PropTypes.bool,
  maxItems: PropTypes.number
}

export default withRouter(TemplateSelection)
