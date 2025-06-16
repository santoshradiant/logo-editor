import React, { createContext, useState, useContext } from 'react'

import PropTypes from 'prop-types'
import { initialInstance } from './initial-state'
import { useBrandkitState } from '@eig-builder/module-brandkit'
import LogoInstance from 'core/logo-maker/logo-instance'
import useAI from '../hooks/use-ai-mfe'
import { useTheme } from '@mui/material/styles'
import Editor from '../components/advance-editor'
import PreviewPage from '../components/preview-page/logo-preview'

export const LogoMFEContext = createContext({})

export const useLogoMFEContext = () => useContext(LogoMFEContext)
const maxLength = 40

export const getHelperText = (value, _maxLength = maxLength) => {
  if (value && value.length) {
    return `${value.length}/${_maxLength}`
  }
}

const LogoMFEWrapper = ({ children, goBack }) => {
  const { state: brandkitState, updateProperty: updateBrandkitProperty } = useBrandkitState()
  const previewImage = React.useRef(null)
  const [showEditor, setEditorVisibility] = React.useState(false)
  const [showPreviewPage, setPreviewPageVisibility] = React.useState(false)
  const theme = useTheme()
  const { isLoadedAI, initAI } = useAI(theme)
  const [instance, setInstance] = useState(
    new LogoInstance(
      {
        ...initialInstance
      },
      null
    )
  )

  const [state, setState] = useState({
    logoId: 15980,
    activeStep: 2,
    steps: [],
    colors: [],
    template: initialInstance
  })

  const updateProperty = (propertyName, newValue) => {
    setState({
      ...state,
      [propertyName]: newValue
    })
  }
  const openAdvanceEditor = () => {
    setEditorVisibility(true)
  }

  const setPreviewImage = (template) => {
    previewImage.current = template
  }
  const handleHome = () => {
    goBack?.()
  }

  const updateProperties = (newProperties) => {
    setState(newProperties)
  }

  return (
    <LogoMFEContext.Provider
      value={{
        state,
        instance,
        openAdvanceEditor,
        maxLength,
        isLoadedAI,
        previewImage,
        brandkitState,
        updateBrandkitProperty,
        showEditor,
        checkIsInNoAccountFlow: false,
        setPreviewPageVisibility,
        handleHome,
        setEditorVisibility,
        setInstance,
        updateProperty,
        updateProperties,
        setPreviewImage,
        initAI
      }}
    >
      {children}
      {!showEditor && <Editor />}
      {showPreviewPage && <PreviewPage logoId={state.logoId} goBack={() => setPreviewPageVisibility(false)} />}
    </LogoMFEContext.Provider>
  )
}

LogoMFEWrapper.propTypes = {
  children: PropTypes.any,
  goBack: PropTypes.any
}

export default LogoMFEWrapper
