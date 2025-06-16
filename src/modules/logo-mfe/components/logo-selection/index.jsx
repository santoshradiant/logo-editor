import React, { memo, useMemo, useRef, useState } from 'react'
import { DrawerPageStep, OnboardingFooter } from '@eig-builder/module-brandkit'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import { useLogoMFEContext } from 'modules/logo-mfe/context/logo-mfe-context'
import Text from '@eig-builder/module-localization'
import { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery'

import LogoSelectionComponent from './components/grid'
import Layout from './logo-selection.views'
import Menu from './components/menu'
import { useSaveLogo } from 'hooks/useLogo'
import useElementWidth from 'hooks/useElementWidth'
import MobileMenu from './components/mobileMenu'

const LogoSelection = memo(() => {
  const {
    state,
    updateProperty,
    instance,
    updateProperties,
    previewImage,
    setPreviewImage,
    maxLength
  } = useLogoMFEContext()
  const [logoState, setLogoState] = useState(state.template)
  const { mutate, isPending, isLoading } = useSaveLogo(false)
  const [disableNext, setDisableNext] = useState(true)
  const ref = useRef(null)
  const width = useElementWidth(ref)
  const isMobile = useIsMobile()
  const createLogoOnServer = _state => {
    if (instance) {
      const details = {
        name: instance.templateData.text.brandName,
        svg: instance.getSVG(),
        logo: JSON.stringify(instance.templateData),
        preview_image_data: previewImage.current
      }

      mutate(details, {
        onSuccess: res => {
          updateProperties({
            ...state,
            activeStep: state.activeStep + 1,
            template: JSON.parse(res.logo),
            logoId: res.id
          })
        }
      })
    }
  }

  const handleNext = () => {
    createLogoOnServer()
  }

  const LogoMemo = useMemo(
    () => (
      <LogoSelectionComponent
        state={logoState}
        instance={instance}
        setPreviewImage={setPreviewImage}
        setDisableNext={setDisableNext}
      />
    ),
    [logoState, instance]
  )

  return (
    <DrawerPageStep
      mobileMenuClosed={<MobileMenu logoState={logoState} />}
      mobileMenuOpen={<Menu maxLength={maxLength} setLogoState={setLogoState} logoState={logoState} />}
      menu={<Menu maxLength={maxLength} setLogoState={setLogoState} logoState={logoState} />}
    >
      <Layout ref={ref}>
        <>
          <Layout.LogoContainer>
            <Layout.HeaderWrapper>
              <Layout.TitleContainer>
                <Typography variant='h2' gutterBottom strong={false}>
                  <Text message='logoMFE.logoSelection.title' />
                </Typography>
                <Typography variant='body1'>
                  <Text message='logoMFE.logoSelection.description' />
                </Typography>
              </Layout.TitleContainer>

              <Layout.TitleBar>
                <Typography variant='h3'>
                  <Text message='logoMFE.logoSelection.selectToEdit' />
                </Typography>
                <Button
                  startIcon={<AutorenewIcon />}
                  variant='contained'
                  color=''
                  onClick={() => {
                    setLogoState({
                      ...logoState,
                      regenerateLogosCount: logoState?.regenerateLogosCount ? (logoState.regenerateLogosCount += 1) : 1
                    })
                  }}
                >
                  <Text message='logoMFE.logoSelection.respinLogos' />
                </Button>
              </Layout.TitleBar>
            </Layout.HeaderWrapper>
            {LogoMemo}
            <Layout.Footer width={width}>
              <OnboardingFooter
                nextButtonText={isMobile ? 'Next' : 'Next - Select Colors'}
                stepCount={state.steps.length}
                step={state.activeStep}
                onBack={() => updateProperty('activeStep', state.activeStep - 1)}
                onNext={handleNext}
                disableNext={disableNext || isPending || isLoading}
              />
            </Layout.Footer>
          </Layout.LogoContainer>
        </>
      </Layout>
    </DrawerPageStep>
  )
})

export default LogoSelection
