import React, { useMemo } from 'react'
import PropTypes from 'prop-types'

import { useLocalize } from '@eig-builder/module-localization'
import OpnUpsellPage from '@eig-builder/compositions-opn-upsell-page'
import { getRuntimeConfig } from '@eig-builder/core-utils/helpers/runtime-config-helper'

import getData from './opn-upsell.constants'

import './lang'

export const getUpsellUrl = (hasSingleProduct) => {
  // get base url and remove subdomain app or app-staging from it
  const baseUrl = window.location.origin.replace(/(app.uat.builder-svcs|app.builder-svcs|app|app-staging)\./, 'www.')
  // for network solution --> /manage-it/website/web-sites-overview.jsp
  const { _brand: brandName } = getRuntimeConfig()
  if (brandName === 'webdotcom') {
    if (hasSingleProduct) {
      return `${baseUrl}/websites/online-store-builder`
    } else {
      return `${baseUrl}/my-account/websites/list`
    }
  } else if (brandName === 'networksolutions') {
    if (hasSingleProduct) {
      return `${baseUrl}/website/diy-website-builder`
    } else {
      return `${baseUrl}/my-account/websites/list`
    }
  }
  // open account manager link in new tab
  return `${baseUrl}/manage-it/web-sites-overview.jsp`
}

const navigate = () => {
  window.location.href = getUpsellUrl()
}

// text is not localized by default, so we need to map the data and localize the text
const mapData = (obj, localize) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  Object.keys(obj).forEach((key) => {
    // if one of these keys, localize the value
    const localizedValue = localize(obj[key])
    obj[key] = localizedValue
    obj[key] = mapData(obj[key], localize)
  })

  return obj
}

const OpnUpsell = ({ unlock = true, onCta }) => {
  const { localize } = useLocalize()
  const localizedData = useMemo(() => mapData(getData(unlock), localize), [localize, unlock])
  return (
    <OpnUpsellPage
      data={localizedData}
      // if oncta type is button call it
      onMainButtonClick={() => (typeof onCta === 'function' ? onCta() : navigate())}
    />
  )
}

OpnUpsell.propTypes = {
  unlock: PropTypes.any,
  onCta: PropTypes.func
}

export default OpnUpsell
