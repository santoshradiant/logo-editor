import { getRuntimeConfig } from 'helpers/runtime/runtime-config-helper'

const getBaseUrl = () => {
  const env = getRuntimeConfig()._env ?? window?.shellRuntime?.runtime?._env ?? 'prod'
  return env === 'prod' || env === 'production'
    ? 'https://api-gw.builderservices.io'
    : 'https://api-gw.uat.builderservices.io'
}

export const aiApi = (path = '', returnType = 'json', useCache = true) => {
  return {
    url: `${getBaseUrl()}/ai-api/v1.0/${path}`,
    useCache,
    returnType
  }
}

export const ids4Api = (path = '', returnType = 'json', useCache = false) => {
  return {
    url: `${getBaseUrl()}/ids4-api/${path}`,
    useCache,
    returnType
  }
}

export const getUjwt = () => ids4Api('ujwt/mine')
