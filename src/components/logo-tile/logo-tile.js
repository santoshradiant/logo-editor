import React, { useCallback, useState } from 'react'
import PropTypes from 'prop-types'
import Text from '@eig-builder/module-localization'
import { YesNo } from '@eig-builder/module-modals/helpers'
import { useModalContext } from '@eig-builder/module-modals/withModalContext'
import LogosSliderLogo from './logo-placeholder-wrapper'
import LogoTileActions from './logo-tile-actions'
import {
  ActionCardHoverBox,
  ImageContainer,
  LogoTileContainer,
  StyledCard,
  StyledInteractableElement
} from './logo-tile.views'
import LogoShareDialog from '../logo-share-dialog/index'
import LogoClient from '../../clients/logo.client'
import { useDuplicateLogo } from 'hooks/useLogo'
import { useEditorContext } from 'logomaker/context/editor-context'
import { useDownload } from 'modules/application-config/features'
import TemporaryLogoClient from '../../clients/temporary-logo.client'
import LogoInstance from 'core/logo-maker/logo-instance'
import { userIsInNoAccountFlow, useApplicationContext } from 'modules/application-config'
import { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery'
import { DataElementLocations } from '@eig-builder/core-utils/helpers/tagging-helper'

const scrollToTop = () =>
  window.scrollTo &&
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  })

const fetchTemplateData = async (logoId) => {
  return userIsInNoAccountFlow() ? TemporaryLogoClient.getLogo(logoId) : LogoClient.getLogo(logoId)
}

const createLogoInstance = async (logoId, setEditorTemplate) => {
  if (window == null) {
    return
  }

  const logoContainer = document.createElement('div')
  window.document.body.appendChild(logoContainer)

  const templateData = await fetchTemplateData(logoId)
  setEditorTemplate(templateData)

  return new LogoInstance(templateData, logoContainer)
}

const LogoTile = ({ logo, makeLogoSelected, goEditLogo, goPreviewLogo, deleteLogo }) => {
  const { id } = logo
  const [shareModalId, setShareModalId] = useState()
  const { setLogoInstance, setEditorTemplate } = useEditorContext()
  const download = useDownload()
  const isMobile = useIsMobile()

  const { canCreateLogo, setShowModal } = useApplicationContext()

  const onDownload = useCallback(async () => {
    const logoInstance = await createLogoInstance(id, setEditorTemplate)
    setLogoInstance(logoInstance)
    download(id, isMobile)
  }, [makeLogoSelected, download, setLogoInstance])

  const duplicateLogo = useDuplicateLogo()

  const updateLogoElement = (element) => {
    const logoRec = logo
    logoRec.element = element
  }

  const { dispatch: modalDispatch } = useModalContext()

  const logoDelete = () => {
    YesNo({
      title: <Text message='logomaker.deleteLogo.header' />,
      content: <Text message='logomaker.deleteLogo.content' />,
      yes: () => deleteLogo(id),
      fullscreen: false
    })(modalDispatch)
  }

  const logoImage = {
    baseImage: logo.preview_image_data,
    url: logo.preview_image_url
  }

  let reconstructedImage = null
  if (logo.regeneratedLogo) {
    reconstructedImage = {
      baseImage: logo.regeneratedLogo,
      url: logo.regeneratedLogo
    }
  }

  const editLogo = () => {
    goEditLogo(id)
  }

  const onDuplicate = () => {
    YesNo({
      title: <Text message='logomaker.duplicateLogo.header' />,
      content: <Text message='logomaker.duplicateLogo.content' />,
      yes: () => {
        if (!canCreateLogo()) {
          setShowModal(true)
          return
        }
        duplicateLogo.mutate(id)
        scrollToTop()
      },
      fullscreen: false
    })(modalDispatch)
  }

  const placeholder = logo.placeholder

  return (
    <LogoTileContainer ref={(el) => updateLogoElement(el)} placeholder={placeholder ? 1 : 0}>
      <StyledInteractableElement floating>
        <StyledCard onClick={!placeholder ? editLogo : undefined} placeholder={placeholder ? 1 : 1}>
          <ImageContainer>
            <LogosSliderLogo placeholder={!!placeholder} image={logoImage} />
          </ImageContainer>
          {reconstructedImage && (
            <ImageContainer>
              <LogosSliderLogo placeholder={!!placeholder} image={logoImage} />
            </ImageContainer>
          )}
        </StyledCard>
      </StyledInteractableElement>
      <ActionCardHoverBox className='options'>
        <LogoTileActions
          onEdit={editLogo}
          onPreview={() => goPreviewLogo(id)}
          onDownload={onDownload}
          onDelete={logoDelete}
          onDuplicate={onDuplicate}
        />
      </ActionCardHoverBox>
      <LogoShareDialog open={!!shareModalId} onClose={() => setShareModalId(null)} shareModalId={shareModalId} />
    </LogoTileContainer>
  )
}

LogoTile.propTypes = {
  logo: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    logo: PropTypes.any,
    preview_image_data: PropTypes.any,
    preview_image_url: PropTypes.string,
    is_read_only: PropTypes.bool,
    modified_on: PropTypes.string,
    meta_data: PropTypes.shape({
      brand_name: PropTypes.string,
      slogan: PropTypes.string,
      brand_color: PropTypes.string,
      slogan_color: PropTypes.string,
      brand_font_name: PropTypes.string,
      slogan_font_name: PropTypes.string
    }),
    regeneratedLogo: PropTypes.any,
    placeholder: PropTypes.any
  }).isRequired,
  makeLogoSelected: PropTypes.func.isRequired,
  goEditLogo: PropTypes.func.isRequired,
  goPreviewLogo: PropTypes.func.isRequired,
  deleteLogo: PropTypes.func.isRequired
}

export default LogoTile
