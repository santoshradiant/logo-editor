import React, { useCallback, useState } from 'react'

import { Button } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import IconButton from '@mui/material/IconButton'
import { Navigation } from '@eig-builder/module-navigation'
import Text from '@eig-builder/module-localization'
import CircularProgress from '@mui/material/CircularProgress'

import useSingletonUndoRedo from 'hooks/useSingletonUndoRedo'
import { useLogoById, useLogoUpdate, useMarkLogoDownloaded } from 'hooks/useLogo'
import useInterval from 'hooks/useInterval'
import EditorContext from 'logomaker/context/editor-context'
import SaveButtonContainer from 'modules/editor/save-button-container'
import Editor from 'modules/editor/containers/editor/editor'
import { useLogoMFEContext } from 'modules/logo-mfe/context/logo-mfe-context'
import { SingleSpaContext } from 'single-spa-react'
import { LogoMakerEditor as LogoMaker } from './logo-maker'
import Layout from 'modules/logo-mfe/components/color-selection/color-selection.views.jsx'
import { styled } from '@mui/material/styles'
import LogoInstance from 'core/logo-maker/logo-instance'
import { saveAs } from 'file-saver'

export const Container = styled('div')`
  position: absolute;
  z-index: 10;
  top: 0;
  left: 0;
  background: white;
  width: 100%;
  height: 100%;
`
export const SaveContainer = styled('div')`
  .app-logo-mfe-MuiButtonBase-root {
    text-transform: uppercase;
  }
`
const parseLogo = data => {
  try {
    return {
      ...data,
      logo: JSON.parse(data?.logo)
    }
  } catch (error) {
    return {}
  }
}

const AdvanceEditorWrapper = () => {
  const { state: logoMfeState, handleHome, setPreviewPageVisibility } = useLogoMFEContext()
  const singleSpaContext = React.useContext(SingleSpaContext)
  const ref = React.useRef()

  const { data: logo, isLoading, isError, isFetching } = useLogoById(logoMfeState.logoId, false)
  const updateLogo = useLogoUpdate(false)
  const initialPresent = logo ? parseLogo(logo) : null
  const { state, set: AddHistory, undo, redo } = useSingletonUndoRedo({
    initialPresent: initialPresent
  })
  const [undoRedoStack, setUndoRedoStack] = useState([])
  const [isLogoDownloadLoading, setLoadingLogoDownload] = useState(false)
  const markLogo = useMarkLogoDownloaded()

  const [scrolled, setScrolled] = useState(false)
  const [saveState, setSaveState] = useState(0)
  const isInParcel = singleSpaContext?.properties != null

  useInterval(() => {
    // process the laste one
    const lastElement = undoRedoStack[undoRedoStack.length - 1]
    if (lastElement) {
      AddHistory(lastElement)
      setUndoRedoStack([])
    }
  }, 500)

  const undoAction = React.useCallback(
    cb => {
      setSaveState(2)
      // eslint-disable-next-line standard/no-callback-literal
      cb(true)
      undo()
    },
    [undo]
  )

  const redoAction = React.useCallback(
    callback => {
      setSaveState(2)
      // eslint-disable-next-line standard/no-callback-literal
      callback(true)
      redo()
    },
    [redo]
  )

  const handleFinish = (saveLogoToServer, logoInstance, unSavedProgress) => {
    setLoadingLogoDownload(true)
    if (unSavedProgress) {
      setSaveState(1)
    }
    const downloadLogoPack = res => {
      setSaveState(0)
      const tempLogoInstance = new LogoInstance(logoInstance.templateData)
      if (ref.current) {
        ref.current.innerHTML = ''
        tempLogoInstance.update()
        ref.current.appendChild(tempLogoInstance.getPreviewElement())
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
            })
          })
          clearInterval(interval)
        }
      }, 100)
    }
    saveLogoToServer(downloadLogoPack)
  }

  const onScrollContent = useCallback(
    propz => {
      if (propz.currentTarget.scrollTop > 0 && scrolled !== true) {
        setScrolled(true)
      }
      if (propz.currentTarget.scrollTop <= 0 && scrolled !== false) {
        setScrolled(false)
      }
    },
    [scrolled]
  )

  if (isError || !logoMfeState.logoId) {
    return <p>No logo found</p>
  }
  return (
    <>
      <Container>
        <Navigation>
          <LogoMaker
            selectedLogo={logo}
            historyLogo={state.present}
            saveLogo={logo => {
              return updateLogo.mutateAsync({ logoId: logoMfeState.logoId, logo })
            }}
            onChange={logoObj => setUndoRedoStack([...undoRedoStack, logoObj])}
          >
            <EditorContext.Consumer>
              {({ setUnSavedProgress, logoInstance, saveLogo, unSavedProgress, activeSegment }) => (
                <>
                  <Navigation.DetailBar>
                    <Navigation.LeftAlign>
                      <IconButton
                        onClick={handleHome}
                        style={{ marginLeft: 8 }}
                        dataElementId='icon'
                        dataElementLabel='navigation-logomaker-back'
                      >
                        <HomeIcon />
                      </IconButton>
                      <Navigation.Spacer spacing='32px' />
                      <LogoMaker.UndoRedo
                        undo={() => undoAction(setUnSavedProgress)}
                        redo={() => redoAction(setUnSavedProgress)}
                      />
                      <Navigation.Spacer spacing='4px' />
                      <SaveContainer>
                        <SaveButtonContainer setSaveState={setSaveState} saveState={saveState} />
                      </SaveContainer>
                      <Navigation.Spacer spacing='4px' />
                      {activeSegment !== 'merch' && (
                        <Button
                          style={{ marginLeft: 12, 'text-transform': 'uppercase' }}
                          onClick={() => setPreviewPageVisibility(true)}
                          variant='contained'
                          color='primary'
                        >
                          <Text message='logoMFE.advanceEditor.preview' />{' '}
                        </Button>
                      )}
                    </Navigation.LeftAlign>
                    <Navigation.CenterAlign />

                    <Navigation.RightAlign>
                      <Navigation.Spacer spacing='12px' />

                      {activeSegment === 'merch' ? (
                        <LogoMaker.EditProductButton isInParcel={isInParcel} />
                      ) : (
                        <Button
                          onClick={() => handleFinish(saveLogo, logoInstance, unSavedProgress)}
                          disabled={isLoading || isLogoDownloadLoading}
                          variant='contained'
                          color='primary'
                          style={{ 'text-transform': 'uppercase' }}
                        >
                          <Text
                            message={`logoMFE.advanceEditor.${isLogoDownloadLoading ? 'downloading' : 'download'}`}
                          />{' '}
                        </Button>
                      )}
                      <Navigation.Spacer spacing='12px' />
                    </Navigation.RightAlign>
                  </Navigation.DetailBar>
                  <Editor
                    loadingFulfilled={!isLoading || !isFetching}
                    scrolled={scrolled}
                    onScrollContent={onScrollContent}
                  />
                </>
              )}
            </EditorContext.Consumer>
            <Layout.DownloadContainer ref={ref} />
          </LogoMaker>
        </Navigation>
        {isLogoDownloadLoading && (
          <Layout.OverlayLoading>
            <CircularProgress size={60} />
          </Layout.OverlayLoading>
        )}
      </Container>
    </>
  )
}

export default AdvanceEditorWrapper
