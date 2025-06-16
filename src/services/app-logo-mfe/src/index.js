import React from 'react'
import { render } from 'react-dom'

import ReactDOM from 'react-dom/client'
import App from './app'

import LogoClient from 'clients/logo.client'
import LogoInstance from 'core/logo-maker/logo-instance'
import AuthUjwtHelper from 'helpers/auth-ujwt-helper'
import { setRuntimeConfig, createRuntime } from 'helpers/runtime/runtime-config-helper'

import defaultTheme from '@eig-builder/core-branding/universal/variables/_mui-theme'
import merge from 'lodash/merge'
import './single-spa-config'
import { BASE_FONT_URL, fontDefintionsRoot } from 'core/logo-maker/resources/font-definitions'

const defaultCallback = () => ''

const getLogoInstance = async ({ logoId, token, callbacks, logoTemplateData = null }) => {
  setRuntimeConfig(createRuntime())
  AuthUjwtHelper.setToken(token)
  AuthUjwtHelper.setRefreshCallback(callbacks?.refreshAccessToken ?? defaultCallback)

  const logoContainer = document.createElement('div')
  window.document.body.appendChild(logoContainer)

  const templateData = logoTemplateData || (await LogoClient.getLogo(logoId))
  const parsedTemplateData = JSON.parse(templateData.logo)

  const logoInstance = new LogoInstance(parsedTemplateData, logoContainer)
  return { logoInstance, logoContainer }
}

export const init = ({ element, theme, locale, callbacks, data, token }) => {
  const palette = merge(defaultTheme.palette, theme.palette)
  const reactElement = React.createElement(
    App,
    {
      theme: { ...theme, palette },
      locale,
      element,
      callbacks,
      data,
      token
    },
    null
  )
  // eslint-disable-next-line react/no-deprecated
  const createRoot = ReactDOM.createRoot || ReactDOM.render
  window.logoMfeId = element.getAttribute('id')
  createRoot(element).render(reactElement)
}

export const closeLogoMfe = selector => {
  selector = window.logoMfeId ?? selector
  document.getElementById(selector).replaceChildren()
  render(<React.StrictMode />, document.getElementById(selector))
}

export const handleDownloadLogoPack = async ({ logoId, token, callbacks, logoTemplateData = null }) => {
  const { logoInstance, logoContainer } = await getLogoInstance({ logoId, token, callbacks, logoTemplateData })
  logoInstance.downloadLogoPack(async () => {
    window.document.body.removeChild(logoContainer)
    await LogoClient.markLogoDownloaded(logoId)
  })
}

export const extractLogoData = async ({ logoId, token, callbacks }) => {
  setRuntimeConfig(createRuntime())
  AuthUjwtHelper.setToken(token)
  AuthUjwtHelper.setRefreshCallback(callbacks?.refreshAccessToken ?? defaultCallback)

  const logoData = await LogoClient.getLogo(logoId)
  return logoData
}

export const getLogoPreview = async ({ logoId, token, callbacks, logoTemplateData = null }) => {
  const { logoInstance } = await getLogoInstance({ logoId, token, callbacks, logoTemplateData })
  return logoInstance.getPreviewElement()
}

export const downloadLogoFont = async ({ logoId, token, callbacks, logoTemplateData = null }) => {
  const {
    meta_data: { brand_font_name: brandFontName }
  } = logoTemplateData || (await extractLogoData({ logoId, token, callbacks }))
  const fontDefinition = fontDefintionsRoot.fontDefinitions.find(font => font.name === brandFontName)

  if (!fontDefinition || fontDefinition.fileName.startsWith('http://localhost')) {
    return { error: 'Font is not supported for download' }
  }

  const getUrlApi = () =>
    fontDefinition.fileName.startsWith('http') ? fontDefinition.fileName : `${BASE_FONT_URL}/${fontDefinition.fileName}`
  await LogoClient.downloadLogoFont(getUrlApi(), `${brandFontName}.ttf`)
  return { success: 'Downloaded file saved' }
}
