import React, { useCallback, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useQueryClient } from '@tanstack/react-query'

import EditorContext from 'logomaker/context/editor-context'
import LogoInstance from 'core/logo-maker/logo-instance'
import LogoMaker from 'core/logo-maker/logo-maker'

// Components
import PreviewButton from 'logomaker/components/preview-button'
import SaveButton from 'logomaker/components/save-button'
import LogoArea from 'components/logo-area/logo-area'
import MerchPreview from 'components/merch-preview'
import LogoDetails from 'logomaker/components/logo-details'
import VariationsArea from 'components/variations-area/variations-area'
import UndoRedo from 'logomaker/components/undo-redo'
import SaveAndClose from 'logomaker/components/save-and-close'
import DownloadButton from 'logomaker/components/download-button'
import EditProductButton from 'logomaker/components/edit-product-button'
import { LogoInspirationWithoutRouter } from 'logomaker/components/logo-inspiration'
import MyLogosGrid from 'logomaker/components/my-logos-grid'
import ControlsAccordion from 'logomaker/components/controls-accordion'
import IconSettingsPanel from 'logomaker/components/icon-settings-panel'
import ControlsTitle from 'logomaker/components/controls-title'
import SegmentTitle from 'logomaker/components/segment-title'
import InverterButton from 'logomaker/components/inverter-button'
import PlayButton from 'logomaker/components/play-button'
import SegmentsPanel from 'logomaker/components/segments-panel'
import IconSettingsButtons from 'logomaker/components/icon-settings-buttons'
import 'logomaker/lang'

// Helpers
import set from 'lodash/set'
import cloneDeep from 'lodash/cloneDeep'
import { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery'

// Misc
import SegmentConfig from 'logomaker/config/segments'
import 'logomaker/styles/editor.scss'
import { getSaveMetaFromTemplateData } from 'core/helpers/post-logo'
// import PricingPlanModal from 'logomaker/components/pricing-plan-modal'
import useLogoAccountLimitations from 'hooks/useLogoAccountLimitations'

const PNG_WIDTH = 1200
const PNG_HEIGHT = 800

const LogoMakerEditor = props => {
  const isMobile = useIsMobile()
  const queryClient = useQueryClient()

  const initialWidth = isMobile ? 320 : 560
  const initialHeight = isMobile ? 255 : 410

  let propedEditorTemplate = props.selectedLogo && props.selectedLogo.logo

  // The template can come in as a sting, when its a new logo / fetched from the sever
  if (typeof propedEditorTemplate === 'string') {
    propedEditorTemplate = JSON.parse(propedEditorTemplate)
    if (!Object.prototype.hasOwnProperty.call(propedEditorTemplate, 'logoVersion')) {
      propedEditorTemplate.logoVersion = 0
    }
  }

  // Refs and states
  const [activeSegment, setActiveSegment] = useState(props?.match?.params?.segment || 'name')
  const [unSavedProgress, setUnSavedProgress] = useState(false)
  const [logoSaved, setLogoSaved] = useState(false)
  const [customVariationTrigger, setCustomVariationTrigger] = useState(0)
  const [editorTemplate, setEditorTemplate] = useState(propedEditorTemplate)
  const [selectedLogo, setSelectedLogo] = useState(props.selectedLogo)
  const logoMaker = useRef(
    new LogoMaker({
      initialWidth,
      initialHeight
    })
  ).current

  const [productURL, setProductURL] = useState('')
  const [merchPreviewURL, setMerchPreviewURL] = useState('')

  const [upgradeModalOpen, setUpgradeModalOpen] = React.useState(false)
  const [logoInstance, setLogoInstance] = useState()
  const [sku, setSku] = useState(null)
  const { data } = useLogoAccountLimitations()
  useEffect(() => {
    if (data?.sku) {
      setSku(data.sku)
    }
  }, [data])

  const setSegementActive = useCallback(
    segment => {
      setActiveSegment(previousSegment => {
        if (previousSegment === segment) {
          return previousSegment
        }

        // const logoId = selectedLogo?.id
        const sectionInfo = SegmentConfig.filter(({ name }) => name === segment.toLowerCase())

        // first time render logoInstance = null
        if (logoInstance != null) {
          // logoInstance.fixInvisbleColors(editorTemplate)
          logoInstance.update(editorTemplate)

          if (sectionInfo.length > 0) {
            logoInstance.showCardLayout(sectionInfo[0].name.startsWith('card'), !sectionInfo[0].name.endsWith('back'))
          } else {
            logoInstance.showCardLayout(false)
          }
        }

        // history.replace(`/editor/${logoId}/${segment}${window.location.search}`)

        return segment
      })
    },
    [editorTemplate, logoInstance, selectedLogo]
  )

  // When you click inside the logo, on those blue hover rectangles.
  const handleLogoElementClick = useCallback(
    sectionName => {
      // Make an quick rewrites
      if (sectionName === 'brand') {
        sectionName = 'name'
      }
      if (sectionName === 'decoration') {
        sectionName = 'backgrounds'
      }

      const sectionInfo = SegmentConfig.filter(x => x.name === sectionName.toLowerCase())
      if (sectionInfo.length) {
        setSegementActive(sectionInfo[0].name)
      }
    },
    [setSegementActive]
  )

  useEffect(() => {
    !editorTemplate && setEditorTemplate(propedEditorTemplate)
  }, [propedEditorTemplate, editorTemplate])

  useEffect(() => {
    if (props.historyLogo) {
      setEditorTemplate(props.historyLogo.logo)
      logoInstance && logoInstance.update(props.historyLogo.logo)
    }
  }, [props.historyLogo, logoInstance])

  // Creation of new logo instance and make sure it's updated on change.
  useEffect(() => {
    setEditorTemplate(editorTemplate)

    if (editorTemplate && !logoInstance) {
      setLogoInstance(
        new LogoInstance({ ...cloneDeep(editorTemplate) }, null, {
          initialWidth: initialWidth,
          initialHeight: initialHeight,
          animate: true,
          onclick: handleLogoElementClick
        })
      )
    } else {
      logoInstance && logoInstance.update(editorTemplate)
    }
  }, [editorTemplate, handleLogoElementClick, initialHeight, initialWidth, logoInstance])

  // When we have new logo's (my logo page), a new selected one, or active segment we should update the state.
  useEffect(() => {
    setSelectedLogo(props.selectedLogo)
    setActiveSegment(props?.match?.params.segment || 'name')
  }, [props.selectedLogo, props?.match?.params.segment])

  const setTemplateActive = newTemplate => {
    if (newTemplate !== null) {
      setEditorTemplate(newTemplate)
      props.onChange?.({
        ...props.selectedLogo,
        logo: newTemplate
      })

      setUnSavedProgress(true)
      setLogoSaved(false)
    }
  }

  // Set an entire template as the editorTemplate, this can be used for example by selecting an variation off your current logo.
  const updateValueInTemplate = (key, value) => {
    const newTemplateDetails = cloneDeep(editorTemplate)
    if (typeof key !== 'string') {
      for (let i = 0; i < key.length; i += 2) {
        set(newTemplateDetails, key[i], key[i + 1])
      }
    } else {
      set(newTemplateDetails, key, value)
    }

    // Trigger history for the undo redo
    props.onChange?.({
      ...selectedLogo,
      logo: newTemplateDetails
    })

    setEditorTemplate(newTemplateDetails)
    setUnSavedProgress(true)
    setLogoSaved(false)
  }
  const setInversion = value => {
    logoInstance.updateBackground(value)
    logoInstance.update(value)
    updateValueInTemplate('isInverted', value)
  }
  // Navigate to the preview page, first save the logo.

  // Save the logo, create an name, get the png from the instance and save the logo to the backend.
  const saveLogoToServer = async callback => {
    if (!props.saveLogo) {
      throw new Error('No save logo property is present')
    }

    // Construct the logo Object
    const details = {
      name: logoInstance.templateData.text.brandName,
      svg: logoInstance.getSVG(),
      logo: JSON.stringify(logoInstance.templateData)
    }

    // Grab the PNG image for the backend post.
    details.preview_image_data = await logoInstance.getPngPromise(PNG_WIDTH, PNG_HEIGHT)
    details.meta_data = getSaveMetaFromTemplateData(logoInstance.templateData)

    // Dispatch an action to the backend.
    try {
      await props.saveLogo(details, selectedLogo.id)
      await queryClient.invalidateQueries('logo')
      callback?.()
      setUnSavedProgress(false)
      setLogoSaved(true)
    } catch (error) {}
  }

  const shouldShowChildren = React.useMemo(() => !props.LogoInstanceRequired || logoInstance != null, [
    props.LogoInstanceRequired,
    logoInstance
  ])

  const value = {
    segments: SegmentConfig,
    activeSegment,
    setActiveSegment: setSegementActive,
    customVariationTrigger,
    triggerVariationsUpdate: () => {
      setCustomVariationTrigger(customVariationTrigger + 1)
    },
    updateValueInTemplate,
    editorTemplate,
    setEditorTemplate,
    setTemplateActive,
    upgradeModalOpen,
    setUpgradeModalOpen,
    logoInstance,
    setLogoInstance,
    logoMaker,
    unSavedProgress,
    setUnSavedProgress, // For undo redo we want to set the changes
    logoSaved,
    selectedLogo: props.selectedLogo,
    setSelectedLogo,
    saveLogo: saveLogoToServer,
    setInversion,
    productURL,
    setProductURL,
    merchPreviewURL,
    setMerchPreviewURL,
    sku
  }

  return (
    <EditorContext.Provider value={value}>
      {shouldShowChildren && props.children}
      {/* {logoInstance && <PricingPlanModal open={upgradeModalOpen} onClose={closeUpgradeModal} />} */}
    </EditorContext.Provider>
  )
}

LogoMakerEditor.defaultProps = {
  doNotSaveOnDownload: false
}

LogoMakerEditor.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]),
  saveLogo: PropTypes.func,
  onChange: PropTypes.func,
  LogoInstanceRequired: PropTypes.bool,
  selectedLogo: PropTypes.any,
  historyLogo: PropTypes.object,
  match: PropTypes.object.isRequired
}

// Compound Statics
LogoMakerEditor.PreviewButton = PreviewButton
LogoMakerEditor.SaveButton = SaveButton
LogoMakerEditor.DownloadButton = DownloadButton
LogoMakerEditor.EditProductButton = EditProductButton
LogoMakerEditor.LogoArea = LogoArea
LogoMakerEditor.MerchPreview = MerchPreview
LogoMakerEditor.LogoDetails = LogoDetails
LogoMakerEditor.LogoInspiration = LogoInspirationWithoutRouter
LogoMakerEditor.MyLogosGrid = MyLogosGrid
LogoMakerEditor.VariationsArea = VariationsArea
LogoMakerEditor.UndoRedo = UndoRedo
LogoMakerEditor.SaveAndClose = SaveAndClose
LogoMakerEditor.ControlsAccordion = ControlsAccordion
LogoMakerEditor.IconSettingsPanel = IconSettingsPanel
LogoMakerEditor.ControlsTitle = ControlsTitle
LogoMakerEditor.SegmentTitle = SegmentTitle
LogoMakerEditor.InverterButton = InverterButton
LogoMakerEditor.PlayButton = PlayButton
LogoMakerEditor.SegmentsPanel = SegmentsPanel
LogoMakerEditor.IconSettingsButtons = IconSettingsButtons

export { EditorContext, LogoMakerEditor, LogoMakerEditor as LogoMaker }
