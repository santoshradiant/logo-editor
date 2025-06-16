import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useTheme, styled } from '@mui/material/styles'
import { SingleSpaContext } from 'single-spa-react'

import LogoArea from '../../../../components/logo-area/logo-area'

import { useOnboardingContext } from '../../context/onboarding-context'

import { useStepperContext } from '@eig-builder/module-stepper'
import Grid from 'core/components/grid'
import LoadingGrid from './loading-grid'

import get from 'lodash/get'
import debounce from 'lodash/debounce'

import initialLogoInstance from 'modules/onboarding/context/initial-logo-instance'
import isEmpty from 'lodash/isEmpty'
import LogoInstance from 'core/logo-maker/logo-instance'
import usePrevious from 'hooks/usePrevious'

import '../../../../logomaker/lang'

import { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery'

const votingMode = window.localStorage.getItem('votingMode')

const PNG_WIDTH = 1200
const PNG_HEIGHT = 800

const StyledContainer = styled('div')`
  max-width: 100%;
  position: relative;

  margin: 0 auto;
  margin-bottom: 24px;

  min-height: 100vh;

  .svg-hover-area {
    :hover {
      outline: transparent;
    }
  }
`

const LogoWrapper = styled('div')`
  transition:
    all 0.7s,
    width 0.7s,
    height 0.7s;
  position: absolute;

  pointer-events: none;

  width: ${({ animateLogo }) => (animateLogo ? 'calc(20.7% - 52px)' : '1280px')};
  top: ${({ animateLogo }) => (animateLogo ? '4px' : 'calc(50vh - 500px)')};
  margin-left: ${({ animateLogo }) => (animateLogo ? '4px' : '0px')};

  max-width: 100%;
  min-width: 410px;

  opacity: ${({ animateLogo }) => (animateLogo ? '0' : '1')};

  @media screen and (max-width: 1440px) {
    min-width: calc(36% - 52px);
    top: 12px;
  }

  z-index: 9999;
  transform: scale(1);

  .logoCard {
    padding: 28px;
  }

  ${({ animateLogo }) =>
    animateLogo &&
    `
      animation: fadeout 1s;
      animation-delay: 0.7s;
      animation-fill-mode: forwards;
      animation-iteration-count: 1;
      animation-timing-function: ease-out;

      @keyframes fadeout {
        0% {
          opacity: 0;
          transform: scale(1);
        }
        10% {
          opacity: 0;
          transform: scale(1);
        }
        100% {
          opacity: 0;
          transform: scale(1);
        }
      }
      div {
        box-shadow: none !important;
      }
    `}
`

const debounceAnimation = debounce((setAnimate) => {
  setAnimate(true)
}, 750)

const Selection = (props) => {
  const {
    stepValues,
    instance,
    setPreviewImage,
    onboardingInfo,
    setInstance,
    setOnboardingTemplate,
    setContinueButton,
    previewImage,
    setSaveLogoLoading,
    isLoadingSaveLogo
  } = useOnboardingContext()

  const context = React.useContext(SingleSpaContext)
  const isInParcel = context.properties != null
  const isMobile = useIsMobile()

  const previousPreviewImage = usePrevious(previewImage)

  const rootRef = useRef()

  const [animate, setAnimate] = useState(false)

  const { palette } = useTheme()

  const [eeState, setEeState] = useState(false)

  const blackPalette = palette.black

  const stepperContext = useStepperContext()

  const navigateToNextStep = stepperContext.navigateToNextStep
  const currentStep = parseInt(stepperContext.currentStep.path)
  const step = isMobile ? currentStep - 1 : currentStep

  const removeColors = useCallback(() => {
    instance.update({
      color: initialLogoInstance.color
    })
  }, [instance])

  const setTextColor = useCallback(
    (color) => {
      instance.update({
        color: {
          palette: [color, color, color, color]
        }
      })
    },
    [instance]
  )

  useEffect(() => {
    if (get(onboardingInfo, 'name') && !eeState) {
      setEeState(true)
      setInstance(
        new LogoInstance(
          {
            text: {
              brandName: get(onboardingInfo, 'name'),
              slogan: get(onboardingInfo, 'slogan')
            },
            color: {
              palette: [...(onboardingInfo?.colors || [])]
            }
          },
          null
        )
      )
    }
  }, [setInstance, onboardingInfo, eeState])

  // clean-up debounce
  useEffect(debounceAnimation.cancel, [])

  useEffect(() => {
    if (!isMobile) {
      if (stepValues.Create.brandName) {
        debounceAnimation(setAnimate)
        removeColors()
      } else if (get(onboardingInfo, 'name')) {
        setAnimate(true)
        removeColors()
      } else {
        debounceAnimation.cancel()
        setTextColor(blackPalette.lighter)
        setAnimate(false)
      }
    }
    instance.update({
      text: {
        brandName: stepValues.Create.brandName,
        slogan: stepValues.Create.slogan
      }
    })
  }, [
    blackPalette.lighter,
    instance,
    isMobile,
    onboardingInfo,
    removeColors,
    setTextColor,
    stepValues.Create.brandName,
    stepValues.Create.slogan
  ])

  const selectTemplateFromRef = (domRef) => {
    const selectedInstance = domRef && domRef.current && domRef.current.dataLogoInstance

    if (selectedInstance) {
      setContinueButton(true)
      setSaveLogoLoading(true)
      setOnboardingTemplate(selectedInstance.templateData)
      // setInstance(selectedInstance)
      instance.update(selectedInstance.templateData)
      selectedInstance.getPngPromise(PNG_WIDTH, PNG_HEIGHT).then((pngData) => {
        setPreviewImage(pngData)
      })
    }
  }

  const getItemAtIndex = React.useCallback(
    (index) => rootRef?.current?.querySelectorAll('.logo-preview-wrapper')?.[index],
    []
  )

  const scrollToItem = useCallback((index, block = 'start') => {
    setTimeout(() => {
      getItemAtIndex(index)?.scrollIntoView?.({
        behavior: 'smooth',
        block
      })
    }, 150)
  }, [])

  React.useEffect(() => {
    scrollToItem(props.maxItems)
  }, [props.maxItems])

  useEffect(() => {
    if (!previousPreviewImage && previewImage) {
      navigateToNextStep()
    }
  }, [previewImage, navigateToNextStep])

  const variateTemplateFont = {
    text: instance.templateData.text,
    // symbol: instance.templateData.symbol,
    color: !isEmpty(onboardingInfo)
      ? {
          ...onboardingInfo?.color
        }
      : undefined
    // layout: {
    //   symbol: {
    //     position: 'none'
    //   }
    // }
  }

  const variateTemplate = {
    font: instance.templateData.font,
    color: instance.templateData.color,
    text: instance.templateData.text
  }

  if (!instance.templateData.text.brandName) {
    instance.update({ text: { brandName: 'BRAND NAME' } })
    props.setMaxItems(props.windowItems())
  }

  useEffect(() => {
    if (!isMobile) {
      setContinueButton(false)
    }
  }, [isMobile, setContinueButton])

  useEffect(() => {
    if (isMobile && step === 1) {
      setContinueButton(false)
    }
  }, [isMobile, setContinueButton, step, stepValues.Create.brandName])

  const showLoader = step === 1 && !isMobile && !animate
  return (
    <StyledContainer ref={rootRef}>
      {!isInParcel && step === 1 && !isMobile && (
        <LogoWrapper animateLogo={animate} className={animate ? 'hide' : ''}>
          <LogoArea inverted={false} logoInstance={instance} />
        </LogoWrapper>
      )}
      {showLoader && isInParcel && <LoadingGrid />}
      {(animate || isMobile) && step === 1 && (
        <Grid
          selectFirstItem={false}
          useFirstTemplate={instance.templateData}
          templateData={variateTemplateFont}
          onSelect={selectTemplateFromRef}
          brandName={stepValues.Create.brandName}
          logoStyle={stepValues.Create.logoStyle}
          regenerateSymbol={stepValues.Create?.regenerateSymbol}
          regenerateLogos={stepValues.Create?.regenerateLogos}
          showHideSymbol={stepValues.Create?.showHideSymbol}
          palette={stepValues.Create?.color?.palette}
          slogan={stepValues.Create.slogan}
          maxItems={props.maxItems}
          votingMode={votingMode}
          showLoader={isLoadingSaveLogo}
          animate
          useDividers={isMobile}
        />
      )}
      {step === 2 && (
        <Grid
          selectFirstItem={false}
          useFirstTemplate={instance.templateData}
          templateData={variateTemplate}
          regenerateSymbol={stepValues.Create?.regenerateSymbol}
          regenerateLogos={stepValues.Create?.regenerateLogos}
          showHideSymbol={stepValues.Create?.showHideSymbol}
          onSelect={selectTemplateFromRef}
          brandName={stepValues.Create.brandName}
          slogan={stepValues.Create.slogan}
          maxItems={props.maxItems}
          logoStyle={stepValues.Create.logoStyle}
          showLoader
          animate
          useDividers={isMobile}
        />
      )}
    </StyledContainer>
  )
}

Selection.propTypes = {
  history: PropTypes.object.isRequired,
  windowItems: PropTypes.func,
  setMaxItems: PropTypes.func,
  maxItems: PropTypes.number
}

export default memo(Selection)
