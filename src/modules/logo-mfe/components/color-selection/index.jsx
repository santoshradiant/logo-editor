import React, { useMemo, useRef, useState, createRef } from 'react'
import {
  DrawerPageStep,
  OnboardingFooter,
  ColorProvider,
  ColorsClosed,
  ColorPicker
} from '@eig-builder/module-brandkit'
import Typography from '@mui/material/Typography'
import isEqual from 'lodash/isEqual'
import { useLogoMFEContext } from 'modules/logo-mfe/context/logo-mfe-context'
import Text from '@eig-builder/module-localization'
import CircularProgress from '@mui/material/CircularProgress'

import Layout from './color-selection.views'
import Preview from './components/preview'
import { useLogoUpdate, useMarkLogoDownloaded } from 'hooks/useLogo'
import { saveAs } from 'file-saver'
import LogoInstance from 'core/logo-maker/logo-instance'
import useElementWidth from 'hooks/useElementWidth'

const PNG_WIDTH = 1200
const PNG_HEIGHT = 800
const ColorSelection = () => {
  const { state, openAdvanceEditor, brandkitState, updateProperties, handleHome } = useLogoMFEContext()
  const markLogo = useMarkLogoDownloaded()

  const templateRef = useRef(state.template)

  const instanceRef = useRef({
    instance: new LogoInstance({ ...state.template }),
    ref: createRef()
  })
  const [colors, setColor] = useState(Object.values(brandkitState?.colors[0] || {}) || [])
  const footerRef = useRef(null)
  const width = useElementWidth(footerRef)
  const downLoadLogoRef = React.useRef()
  const [isLogoDownloadLoading, setLoadingLogoDownload] = React.useState(false)

  const { mutate, isPending, isLoading } = useLogoUpdate(false)

  const handleColors = newColors => {
    if (Object.values(newColors).every(Boolean) && !isEqual(colors, newColors)) {
      setColor(newColors)
    }
  }

  const handleEditor = () => {
    const goToEditor = res => {
      updateProperties({
        ...state,
        logoId: res.id
      })
      openAdvanceEditor()
    }
    handleUpdate(goToEditor)
  }

  const handleUpdate = async (cb = () => {}) => {
    if (instanceRef.current.instance) {
      const tempLogoInstance = instanceRef.current.instance
      tempLogoInstance.updateLayout()
      const previewImg = await tempLogoInstance.getPngPromise(PNG_WIDTH, PNG_HEIGHT)
      const logo = {
        name: tempLogoInstance.templateData.text.brandName,
        svg: tempLogoInstance.getSVG(),
        logo: JSON.stringify(tempLogoInstance.templateData),
        preview_image_data: previewImg
      }

      mutate(
        { logoId: state.logoId, logo },
        {
          onSuccess: cb,
          onError: () => {
            console.error('Logo update failed')
            setLoadingLogoDownload(false)
          }
        }
      )
    }
  }

  const handleFinish = () => {
    setLoadingLogoDownload(true)

    const downloadLogoPack = res => {
      const tempLogoInstance = new LogoInstance(instanceRef.current.instance.templateData)
      if (downLoadLogoRef.current) {
        downLoadLogoRef.current.innerHTML = ''
        tempLogoInstance.update()
        downLoadLogoRef.current.appendChild(tempLogoInstance.getPreviewElement())
      }
      tempLogoInstance.createLayout()
      tempLogoInstance.updateLayout()
      const configs = tempLogoInstance.getConfigs(true)

      const interval = setInterval(() => {
        if (tempLogoInstance.checkAllResourcesLoaded()) {
          tempLogoInstance.updateLayout(false, () => {
            tempLogoInstance.createLogoZip(configs, (blob, zipName) => {
              try {
                markLogo.mutate(state.logoId)
              } catch (error) {
                console.log(error)
              }
              saveAs(blob, zipName)
              setLoadingLogoDownload(false)
              handleHome()
            })
          })
          clearInterval(interval)
        }
      }, 100)
    }
    handleUpdate(downloadLogoPack)
  }

  const formatColors = (colors = []) => {
    if (Array.isArray(colors)) {
      return colors.map(c => ({ color1: c.primary, color2: c.secondary, color3: c.tertiary, color4: c.quaternary }))
    } else {
      return []
    }
  }

  const PreviewMemo = useMemo(() => {
    if (isLoading || isPending) {
      templateRef.current = instanceRef.current.instance.templateData
    }
    const currentTemplate = templateRef.current
    const colorValues = Object.values(colors)
    const hasValidColors = colorValues.length > 0
    const updatedTemplate = {
      ...currentTemplate,
      color: {
        ...currentTemplate.color,
        paletteDark: hasValidColors ? colorValues : currentTemplate.color.paletteDark,
        palette: hasValidColors ? colorValues : currentTemplate.color.palette
      }
    }
    return (
      <Preview
        instanceRef={instanceRef}
        onClick={handleEditor}
        isEditorLoading={isPending || isLoading}
        template={updatedTemplate}
      />
    )
  }, [templateRef.current, colors, isPending, isLoading])

  const handleRespinColor = () => {
    brandkitState.generateColors()
  }

  return (
    <ColorProvider
      isLoading={brandkitState?.isLoadingColors}
      setSelectedColors={handleColors}
      colors={formatColors(brandkitState?.colors, 'picker')}
      handleRespin={handleRespinColor}
    >
      <DrawerPageStep
        menu={<ColorPicker />}
        mobileMenuOpen={<ColorPicker />}
        mobileMenuClosed={<ColorsClosed setOpen selectedColor={Object.values(colors)} />}
      >
        <Layout ref={footerRef}>
          <Layout.DownloadContainer ref={downLoadLogoRef} />
          <Layout.LogoContainer>
            <Layout.HeaderWrapper>
              <Layout.TitleContainer>
                <Typography variant='h2' gutterBottom>
                  <Text message='logoMFE.colorSelection.colorMatchYourVibe' />{' '}
                </Typography>
                <Typography variant='body1'>
                  <Text message='logoMFE.colorSelection.useColorPicker' />
                </Typography>
              </Layout.TitleContainer>
            </Layout.HeaderWrapper>
            {PreviewMemo}
            <Layout.Footer width={width}>
              <OnboardingFooter
                nextButtonText='Finish - Download'
                disableNext={isPending || isLoading || isLogoDownloadLoading}
                hideBack
                stepCount={state.steps.length}
                step={state.activeStep}
                onNext={handleFinish}
              />{' '}
            </Layout.Footer>
          </Layout.LogoContainer>
        </Layout>
        {isLogoDownloadLoading && (
          <Layout.OverlayLoading>
            <CircularProgress size={60} />
          </Layout.OverlayLoading>
        )}
      </DrawerPageStep>
    </ColorProvider>
  )
}

export default ColorSelection
