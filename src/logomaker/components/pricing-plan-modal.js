import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { styled } from '@mui/material/styles'

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'

import PricingPlan from '@eig-builder/compositions-pricing-plan'
import InteractiveFeatureList from '@eig-builder/compositions-interactive-feature-list'

import { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery'
import { goToWithHistory } from '@eig-builder/core-utils/helpers/go-to-helper'

import Modal from '@eig-builder/module-modal'
import Text from '@eig-builder/module-localization'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'

import PaidPlanPngIcons from 'logomaker/images/paid-plan-png-icons.svg'
import PaidPlanVectorIcons from 'logomaker/images/paid-plan-vector-icons.svg'
import PaidPlanSocialIcons from 'logomaker/images/paid-plan-social-icons.svg'
import PaidPlanAppIcons from 'logomaker/images/paid-plan-app-icons.svg'
import { useEditorContext } from 'logomaker/context/editor-context'
import FeatureTooltipOverlay from 'logomaker/components/feature-tooltip-overlay'
import { useNavigate } from 'react-router'

const FullWidthButton = styled(Button)`
  width: 100%;
`
const FeatureTooltip = styled('div')`
  flex: 1;
  margin-left: ${({ theme }) => theme.spacing(6)};
  margin-top: ${({ theme }) => theme.spacing(-6)};
  margin-bottom: ${({ theme }) => theme.spacing(-6)};
  margin-right: ${({ theme }) => theme.spacing(-6)};
  padding: ${({ theme }) => theme.spacing(6)};
  background-color: ${({ theme }) => theme.palette.lightGray.main};
`
const FeatureImage = styled('img')`
  max-width: 100%;
  visibility: ${({ hidden }) => (hidden ? 'hidden' : 'visible')};
`
const FeatureImageSkeleton = styled(Skeleton)`
  width: 100%;
  max-width: 335px;
  height: 0;
  padding-top: min(236px, ${(236 / 335) * 100}%);
`
const LogoPreviewContainer = styled('div')`
  background-color: ${({ theme }) => theme.palette.white.main};
  width: 335px;
  height: 260px;
`
const LogoPreview = styled('img')`
  width: 100%;
  height: 100%;
  margin: 0 auto;
  object-fit: contain;
`
const BoldText = styled(Text)`
  font-weight: bold;
`

const DefaultTooltip = ({ logoInstance, templateData }) => {
  const [logoUrl, setLogoUrl] = React.useState()

  React.useEffect(() => {
    if (templateData?.preview_image_url) {
      setLogoUrl(templateData.preview_image_url)
      return
    }
    logoInstance.getPng(640, 640, (url) => setLogoUrl(url))
  }, [logoInstance])

  return (
    <>
      <Typography variant='h2' className='pb-4'>
        <Text message='logoBuilder.upgradeModal.defaultTooltip.title' />
      </Typography>
      <LogoPreviewContainer className='mb-4'>
        <LogoPreview src={logoUrl} />
      </LogoPreviewContainer>
      <Typography variant='subtitle1' className='pb-4'>
        <Text message='logoBuilder.upgradeModal.defaultTooltip.description_0' />
      </Typography>
      <Typography variant='subtitle1'>
        <Text message='logoBuilder.upgradeModal.defaultTooltip.description_1' />
      </Typography>
    </>
  )
}

const FeatureElement = ({ titleMessage, imageSrc, children, isMobile, onClose }) => {
  const [showSkeleton, setShowSkeleton] = useState(true)

  return (
    <>
      <Typography variant={isMobile ? 'h3' : 'h2'} className={'pb-4 ' + (isMobile ? 'd-flex pt-1' : '')}>
        {onClose != null && <ChevronLeftIcon onClick={onClose} />}
        <Text message={titleMessage} className={isMobile ? 'pl-2' : ''} />
      </Typography>
      <FeatureImage
        src={imageSrc}
        hidden={showSkeleton}
        onLoad={() => setShowSkeleton(false)}
        className={showSkeleton ? '' : 'pb-4'}
      />
      {showSkeleton && <FeatureImageSkeleton variant='rect' className='mb-4' />}
      {children}
    </>
  )
}

FeatureElement.propTypes = {
  titleMessage: PropTypes.string.isRequired,
  imageSrc: PropTypes.any.isRequired,
  children: PropTypes.oneOf([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
  isMobile: PropTypes.bool,
  onClose: PropTypes.func.isRequired
}

const Feature = (titleMessage, imageSrc, children) => (properties) => (
  <FeatureElement
    titleMessage={titleMessage}
    imageSrc={imageSrc}
    children={children}
    isMobile={properties.isMobile}
    onClose={properties.onClose}
  />
)
Feature.propTypes = {
  titleMessage: PropTypes.string.isRequired,
  imageSrc: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
}
DefaultTooltip.propTypes = {
  logoInstance: PropTypes.object.isRequired,
  templateData: PropTypes.object
}

const FreePlan = () => (
  <PricingPlan.Item>
    <PricingPlan.Item.Header className='pt-3 pb-2'>
      <Typography variant='h1'>
        <Text message='logoBuilder.upgradeModal.freePlan.title' />
      </Typography>
      <Box mt={2}>
        <Chip customColor='primary.background' color='primary' label='Current Plan' size='small' />
      </Box>
    </PricingPlan.Item.Header>
    <PricingPlan.Item.Content>
      <PricingPlan.Item.Content.Title />
      <PricingPlan.Item.Content.Description
        messages={[
          'logoBuilder.upgradeModal.freePlan.description_0',
          'logoBuilder.upgradeModal.freePlan.description_1',
          'logoBuilder.upgradeModal.freePlan.description_2'
        ]}
      />
    </PricingPlan.Item.Content>
  </PricingPlan.Item>
)

const paidFeatures = [
  {
    message: 'logoBuilder.upgradeModal.paidPlan.feature_0.title',
    tooltip: Feature(
      'logoBuilder.upgradeModal.paidPlan.feature_0.title',
      PaidPlanPngIcons,
      <>
        <Typography variant='subtitle1' className='pb-4'>
          <Text message='logoBuilder.upgradeModal.paidPlan.feature_0.description_0' />
        </Typography>
        <Typography variant='h3' className='pb-2'>
          <Text message='logoBuilder.upgradeModal.paidPlan.feature_0.benefitsTitle' />
        </Typography>
        <Typography variant='subtitle1'>
          <Text message='logoBuilder.upgradeModal.paidPlan.feature_0.benefits_0' />
        </Typography>
      </>
    )
  },
  {
    message: 'logoBuilder.upgradeModal.paidPlan.feature_1.title',
    tooltip: Feature(
      'logoBuilder.upgradeModal.paidPlan.feature_1.title',
      PaidPlanVectorIcons,
      <>
        <Typography variant='h3' className='pb-2'>
          <Text message='logoBuilder.upgradeModal.paidPlan.feature_1.benefitsTitle' />
        </Typography>
        <Typography variant='subtitle1' className='pb-3'>
          <Text message='logoBuilder.upgradeModal.paidPlan.feature_1.benefits_0' />
        </Typography>
        <Typography variant='subtitle1'>
          <Text message='logoBuilder.upgradeModal.paidPlan.feature_1.benefits_1' />
        </Typography>
      </>
    )
  },
  {
    message: 'logoBuilder.upgradeModal.paidPlan.feature_2.title',
    tooltip: Feature(
      'logoBuilder.upgradeModal.paidPlan.feature_2.title',
      PaidPlanSocialIcons,
      <>
        <Typography variant='h3' className='pb-2'>
          <Text message='logoBuilder.upgradeModal.paidPlan.feature_2.benefitsTitle' />
        </Typography>
        <Typography variant='subtitle1'>
          <Text
            message='logoBuilder.upgradeModal.paidPlan.feature_2.benefits_0'
            values={{
              facebook: <BoldText message='Facebook' />,
              linkedIn: <BoldText message='LinkedIn' />,
              pinterest: <BoldText message='Pinterest' />,
              youTube: <BoldText message='YouTube' />,
              twitter: <BoldText message='Twitter' />,
              etsy: <BoldText message='Etsy' />
            }}
          />
        </Typography>
      </>
    )
  },
  {
    message: 'logoBuilder.upgradeModal.paidPlan.feature_3.title',
    tooltip: Feature(
      'logoBuilder.upgradeModal.paidPlan.feature_3.title',
      PaidPlanAppIcons,
      <>
        <Typography variant='h3' className='pb-2'>
          <Text message='logoBuilder.upgradeModal.paidPlan.feature_3.benefitsTitle' />
        </Typography>
        <Typography variant='subtitle1'>
          <Text
            message='logoBuilder.upgradeModal.paidPlan.feature_3.benefits_0'
            values={{
              appIcons: <BoldText message='App Icons' />,
              ios: <BoldText message='iOS' />,
              android: <BoldText message='Android' />,
              appStore: <BoldText message='App Store' />,
              playStore: <BoldText message='Play Store' />
            }}
          />
        </Typography>
      </>
    )
  }
]

const PaidPlan = ({ onSelectFeature, onPurchase, onDownloadExamplePack, isMobile }) => (
  <PricingPlan.Item>
    <PricingPlan.Item.Header className='py-3'>
      <Typography variant='h1'>
        <Text message='logoBuilder.upgradeModal.paidPlan.title' />
      </Typography>
    </PricingPlan.Item.Header>
    <PricingPlan.Item.Content>
      <PricingPlan.Item.Content.Title message='logoBuilder.upgradeModal.includes' />
      <PricingPlan.Item.Content.Description
        messages={[
          'logoBuilder.upgradeModal.paidPlan.description_0',
          'logoBuilder.upgradeModal.paidPlan.description_1'
        ]}
      />
      <PricingPlan.Item.Content.Title message='logoBuilder.upgradeModal.downloadableFiles' />
      <InteractiveFeatureList
        behavior={isMobile ? 'click' : 'hover'}
        features={paidFeatures}
        onSelectFeature={onSelectFeature}
        className='mb-2'
      />
    </PricingPlan.Item.Content>
    <PricingPlan.Item.Footer className='mt-4'>
      <FullWidthButton className='mb-1' onClick={onPurchase}>
        <Typography variant='h4'>
          <Text message='logoBuilder.upgradeModal.paidPlan.primaryButton' />
        </Typography>
      </FullWidthButton>
      <FullWidthButton onClick={onDownloadExamplePack} variant='text'>
        <Typography variant='h4'>
          <Text message='logoBuilder.upgradeModal.paidPlan.secondaryButton' />
        </Typography>
      </FullWidthButton>
    </PricingPlan.Item.Footer>
  </PricingPlan.Item>
)

PaidPlan.propTypes = {
  onSelectFeature: PropTypes.func.isRequired,
  onPurchase: PropTypes.func.isRequired,
  onDownloadExamplePack: PropTypes.func.isRequired,
  isMobile: PropTypes.bool
}

const PricingPlanModal = ({ open, onClose }) => {
  const navigate = useNavigate()
  const { logoInstance, selectedLogo, setUpgradeModalOpen, editorTemplate } = useEditorContext()
  const [selectedFeature, setSelectedFeature] = React.useState()

  const isMobile = useIsMobile()

  const onPurchase = React.useCallback(() => {
    goToWithHistory(navigate, '/../account/settings/plansandpricing')
    setUpgradeModalOpen(false)
  }, [selectedLogo?.id, setUpgradeModalOpen])

  const onDownloadExamplePack = React.useCallback(() => {
    const element = document.createElement('a')
    element.href = 'https://bootstrapstorageprod.blob.core.windows.net/assets/mywebsitebuilder/Jimmies.zip'
    element.style.display = 'none'

    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }, [])

  const clearSelectedFeature = React.useCallback(() => {
    setSelectedFeature(null)
  }, [])

  return (
    <Modal open={open} onClose={onClose} maxWidth='lg' fullScreen={isMobile}>
      <Modal.Header>
        <Modal.Alignment alignSelf='center'>
          <Modal.Header.Title title={<Text message='logoBuilder.upgradeModal.title' />} />
        </Modal.Alignment>
        <Modal.Alignment rightAligned>
          <Modal.Header.Close />
        </Modal.Alignment>
      </Modal.Header>
      <Modal.Content
        style={{ overflowX: 'hidden', overflowY: isMobile && selectedFeature?.tooltip != null ? 'hidden' : 'scroll' }}
      >
        <PricingPlan>
          <FreePlan />
          <PaidPlan
            onSelectFeature={setSelectedFeature}
            onPurchase={onPurchase}
            onDownloadExamplePack={onDownloadExamplePack}
            isMobile={isMobile}
          />
          {!isMobile && (
            <FeatureTooltip>
              {(selectedFeature?.tooltip != null && React.createElement(selectedFeature.tooltip, { isMobile })) || (
                <DefaultTooltip logoInstance={logoInstance} templateData={editorTemplate} />
              )}
            </FeatureTooltip>
          )}
        </PricingPlan>
      </Modal.Content>
      {isMobile && <FeatureTooltipOverlay tooltip={selectedFeature?.tooltip} onClose={clearSelectedFeature} />}
      <Modal.Footer bordered>
        <Modal.Alignment rightAligned>
          <Modal.Footer.Button variant='outlined' onClick={onClose} tag='close'>
            <Text message='logoBuilder.upgradeModal.close' />
          </Modal.Footer.Button>
        </Modal.Alignment>
      </Modal.Footer>
    </Modal>
  )
}

PricingPlanModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired
}

export default PricingPlanModal
