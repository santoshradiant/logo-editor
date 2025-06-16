
import { getRuntimeConfig } from '@eig-builder/core-utils/helpers/runtime-config-helper'

import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import pick from 'lodash/pick'
import pickBy from 'lodash/pickBy'
import first from 'lodash/first'
import keys from 'lodash/keys'
import values from 'lodash/values'
import reduce from 'lodash/reduce'
import replace from 'lodash/replace'
import isNil from 'lodash/isNil'


const getHelpAndTerms = name => {
  const runtimeConfig = getRuntimeConfig()
  if (!runtimeConfig._help && !runtimeConfig._terms) {
    return null
  }
  switch (name) {
    case 'domainexpiry':
      return get(runtimeConfig._help, 'domainexpiry')
    case 'freeSSL':
      return get(runtimeConfig._help, 'freessl')
    case 'how-do-i-link-a-domain':
      return get(runtimeConfig._help, 'howtolinkadomain')
    case 'learnMoreAlexa':
      return get(runtimeConfig._help, 'learnmorealexa')
    case 'learnMoreVat':
      return get(runtimeConfig._help, 'learnmorevat')
    case 'paypal-account-update-faq':
      return get(runtimeConfig._help, 'paypal-update')
    case 'regularRates':
      return get(runtimeConfig._help, 'regularrates')
    case 'whois-information-domain-privacy':
      return get(runtimeConfig._help, 'whois')
    case 'autoRenewal':
      return get(runtimeConfig._terms, 'autorenewal')
    case 'cancellation':
      return get(runtimeConfig._terms, 'cancellation')
    case 'moneyBack':
      return get(runtimeConfig._terms, 'moneyback')
    case 'privacyPolicy':
      return get(runtimeConfig._terms, 'privacypolicy')
    case 'terms':
      return get(runtimeConfig._terms, 'terms')
    default:
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`Couldn't find '${name}' in the help/terms list`)
      }
      return ''
  }
}


/**
 * Convert the existing siteNames to use the naming from the configuration api
 */
const appMapping = {
  accounts_api: 'accounts.api',
  'app-gateway': 'app_gateway.api',
  app: 'control_panel.shell',
  assets: 'general.assets',
  'blog-viewer-api': 'blog.public_api',
  dataproxy: 'data_proxy.api',
  helpchat: 'general.help_chat',
  helppage: 'general.help_page',
  publicUrl: 'general.public_url',
  'image-proxy': 'image_proxy.api',
  login: 'control_panel.login',
  login_oauth: 'control_panel.login_o_auth',
  'mail-editor': 'email_marketing.editor',
  mail_viewer: 'email_marketing.public_api',
  my: 'control_panel.my',
  'responsive-editor': 'responsive_editor.editor',
  storage: 'storage_service.api',
  'store-editor': 'store.store_editor',
  'store-shop': 'store.store_shop',
  translations: 'translations.api',
  publishedsites: 'publishedsites',
  'cp-checkout': 'checkout.checkout',
  'store-onboarding': 'store.store_onboarding',
  social: 'social.shell',
  social_api: 'social.api',
  ctctLoginPage: 'general.ctct_login',
  ctctForgotPasswordPage: 'general.ctct_forgot_password',
  ctctGoogleAuth: 'general.ctct_google_auth',
  ctctFacebookAuth: 'general.ctct_facebook_auth',
  ctctLogoutPage: 'general.ctct_logout',
  ctctSessionInfo: 'general.ctct_session_info',
  ctctDashboard: 'general.ctct_app',
  ctctAdapterHtmlPage: 'general.ctct_adapter_html',
  'storedash-shop': 'storedash.storedash_checkout_ecom'
}

let globalStoreLocale = null
let globalStoreToken = null
let globalInstanceJwt = null
let storeBrandFromQs = null

const termsAndPolicyPaths = {
  terms: '/terms#terms-of-service',
  privacyPolicy: '/terms#privacy-policy',
  cancellation: '/terms#cancellation',
  // regularRates: defined per brand in settings.js   regularRates: '/terms#terms-of-service',
  moneyBack: '/terms#refunds',
  autoRenewal: '/terms#autoRenewal'
}

const MYWEBSITEBUILDER_BASE_URL = 'mywebsitebuilder.com'

/**
 * Hardcoded list of avaible siteNames
 * note: the names should be the same in the urls section for each brand, brands/{BRAND}/settings.js
 *
 * @static
 *
 * @memberOf UrlHelper
 */
export const siteNames = {
  MAIL_EDITOR: 'mail-editor',
  REGULAR_RATES: 'regular_rates',
  LEARN_MORE_VAT: 'learn_more_vat',
  MY: 'my',
  APP: 'app',
  CP_MY: 'my',
  CP_CHECKOUT: 'cp-checkout',
  API: 'api',
  APP_MARKET_API: 'app_market_api',
  ACCOUNTS_API: 'accounts_api',
  RE_API: 're_api', // responsive editor api
  HOSTING_API: 'hosting_api', // responsive editor api
  RE_TEMPLATE_SELECTOR: 'template-selector',
  RESPONSIVE_EDITOR: 'responsive-editor',
  CE_API: 'ce_api',
  API_LOGIN: 'apilogin',
  LOGO_API_LOGIN: 'logo_api_login',
  LOGO_API: 'logo_api',
  API_CDN: 'api_cdn',
  API_CRM: 'api_crm',
  CHECKOUT: 'checkout',
  CRM: 'crm',
  AUTH: 'auth',
  LOGIN: 'login',
  LOGIN_OAUTH: 'login_oauth',
  SIGNUP: 'signup',
  SIGNUP_SUCCESS: 'signup-success',
  MANAGEMENT_API: 'management-api',
  MANAGEMENT_PORTAL_API: 'management-portal-api',
  RESETPW: 'forgotpass',
  TRANSLATION: 'translations',
  PUBLISHEDSITES: 'publishedsites',
  CAP: 'cap',
  EVENTS: 'events',
  CC: 'cc',
  HELPCHAT: 'helpchat',
  STORE_EDITOR_API: 'store-editor-api',
  STORE_SHOP_API: 'store-shop-api',
  STORE_SHOP: 'store-shop',
  STOREDASH_SHOP: 'storedash-shop',
  SDK_SHOPPING_CART: 'sdk-shopping-cart',
  STOREDASH_SDK_SHOPPING_CART: 'storedash-sdk-shopping-cart',
  SDK_ANALYTICS_TRACKER: 'sdk-analytics-tracker',
  NOTIFICATIONS: 'notifications',
  IMAGE_PROXY: 'image-proxy',
  SDK_SOCIAL_COMPOSER: 'sdk-social-composer',
  SOCIAL_COMPOSER: 'social-composer',
  API_SOCIAL_SUITE: 'api-social-suite',
  SOCIAL: 'social',
  BILLING_API: 'billing-api',
  BLOG_API: 'blog-api',
  BLOG_VIEWER_API: 'blog-viewer-api',
  BUSINESS_INFO: 'business-info',
  MAIL_VIEWER: 'mail_viewer'
}

export const productNames = {
  ACCOUNTS: 'accounts',
  APP_GATEWAY: 'app_gateway',
  APPMARKET: 'appmarket',
  BLOG: 'blog',
  BOOKING: 'booking',
  BUSINESS: 'business',
  CHECKOUT: 'checkout',
  CONTACTS: 'contacts',
  CONTROL_PANEL: 'control_panel',
  EMAIL_MARKETING: 'email_marketing',
  FEATURE_SERVICE: 'feature_service',
  GENERAL: 'general',
  IMAGE_PROXY: 'image_proxy',
  LOGO_MAKER: 'logo_maker',
  NPS: 'nps',
  RESPONSIVE_EDITOR: 'responsive_editor',
  SITES: 'sites',
  SOCIAL: 'social',
  STORAGE_SERVICE: 'storage_service',
  STORE: 'store',
  TRADITIONAL_EDITOR: 'traditional_editor',
  TRANSLATIONS: 'translations'
}

const hostNameSites = [siteNames.RE_API, siteNames.BLOG_API, 'app-gateway']

function setGlobalStoreLocale (newVal) {
  globalStoreLocale = newVal
}

function setGlobalInstanceJwt (newVal) {
  globalInstanceJwt = newVal
}

function setStoreBrandFromQs (newVal) {
  storeBrandFromQs = newVal
}

function setGlobalStoreToken (newVal) {
  globalStoreToken = newVal
}

/**
 * Get base url from site name
 *
 * @function
 * @param {any} sitename, use siteNames.{any}
 * @param {any} productname, use productNames.{any}
 * @returns {string} base url
 *
 * @memberOf UrlHelper
 */
function getBaseUrl (sitename, productname) {
  const runtimeConfig = getRuntimeConfig()
  let url = null
  if (runtimeConfig.version === 2) {
    if (sitename && productname) {
      url = get(runtimeConfig._brandedUrls, `${productname}.${sitename}`)
    } else {
      const newUrlName = appMapping[sitename]
      url = get(runtimeConfig._brandedUrls, newUrlName)
    }
  } else {
    url = get(runtimeConfig._urls, `${sitename}`)
  }

  if (shouldUseOwnDomain(sitename, url) !== true) {
    return url
  }

  // Exception for store-shop. We want the original url in the endurance brand
  if (getRuntimeConfig()._app === 'app-store-shop' || getRuntimeConfig()._app === 'app-store-editor' || getRuntimeConfig()._app === 'app-store-onboarding' || getRuntimeConfig()._app === 'app-storedash-checkout') {
    // And remove -staging from the url for non-prod
    if (getRuntimeConfig()._env !== 'prod') {
      return url.replace('-staging', '')
    }
    return url
  }

  return getHostName(url)
}

function getHostName (url) {
  const hostedDomain = getDomainForHostedBrand()

  if (getRuntimeConfig()._env === 'prod') {
    return url.replace(MYWEBSITEBUILDER_BASE_URL, hostedDomain)
  } else {
    const regex = new RegExp(`(.[a-z]+.)(${MYWEBSITEBUILDER_BASE_URL})`)
    // Strip environment prefixes like latest, qa, uat
    const regexResult = regex.exec(url)
    if (!regexResult) {
      return ''
    }
    if (regexResult[1]) {
      if (hostedDomain.indexOf('beta') === 0) {
        return url.replace(MYWEBSITEBUILDER_BASE_URL, hostedDomain).replace(regexResult[1], '.').replace('-staging', '')
      }

      return url.replace(MYWEBSITEBUILDER_BASE_URL, hostedDomain).replace(regexResult[1], '.')
    } else {
      if (hostedDomain.indexOf('beta') === 0) {
        return url.replace(MYWEBSITEBUILDER_BASE_URL, hostedDomain).replace('-staging', '')
      }

      return url.replace(MYWEBSITEBUILDER_BASE_URL, hostedDomain)
    }
  }
}

function getBrandName () {
  let currentBrandName = getRuntimeConfig()._brandDisplayName

  if (currentBrandName.toLowerCase() === 'gator') {
    currentBrandName = 'HostGator'
  }

  return currentBrandName
}

/**
 * get urls for terms and such
 *
 * @function
 * @param {string} name, terms/privacyPolicy/cancellation
 *
 * @memberOf UrlHelper
 */

function getPublicUrl () {
  const runtimeConfig = getRuntimeConfig()
  if (runtimeConfig.version === 2) {
    return getBaseUrl('publicUrl')
  }
  if (runtimeConfig._urls) {
    return runtimeConfig._urls.publicUrl
  }
}

function shouldUseOwnDomain (sitename, url) {
  const currentBrand = getRuntimeConfig()._brand

  // Return the hostname for certain sitenames if they're using mywebsitebuilder, due to same origin policy
  return url && currentBrand === 'endurance' && hostNameSites.includes(sitename)
}

function getTermsUrl (name) {
  const runtimeConfig = getRuntimeConfig()
  if (runtimeConfig.version === 2) {
    return getHelpAndTerms(name)
  }
  if (name === 'regularRates') {
    return getBaseUrl(siteNames.REGULAR_RATES)
  }

  if (name === 'learnMoreVat') {
    return getBaseUrl(siteNames.LEARN_MORE_VAT)
  }

  const environmentUrls = runtimeConfig._urls
  const terms = environmentUrls.termsUrls

  if (terms && terms[name]) {
    return terms[name]
  }
  return getBaseUrl(siteNames.CAP) + termsAndPolicyPaths[name]
}

function getKBUrl (name) {
  const runtimeConfig = getRuntimeConfig()
  if (runtimeConfig.version === 2) {
    return getHelpAndTerms(name)
  }

  const environmentUrls = runtimeConfig._urls

  const kbArticles = environmentUrls.kb || {}
  return kbArticles[name]
}

function getSupportUrl () {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`This method 'getSupportUrl' is deprecated and will be removed in core-utils 4.0.0`)
  }
  const environmentUrls = getRuntimeConfig()._urls
  if (environmentUrls) {
    return environmentUrls.domainSupport
  }
  return getHelpUrl()
}

function getHelpUrl () {
  const runtimeConfig = getRuntimeConfig()
  if (runtimeConfig.version === 2) {
    return getBaseUrl('helppage') || `https://help.${runtimeConfig._brand}.com`
  }

  const environmentUrls = runtimeConfig._urls
  return (environmentUrls && environmentUrls.helpPage) || `https://help.${runtimeConfig._brand}.com`
}

function getDocumentationUrl (isDevPortal = false) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`This method 'getDocumentationUrl' is deprecated and will be removed in core-utils 4.0.0`)
  }
  const runtimeConfig = getRuntimeConfig()
  if (runtimeConfig.version === 2) {
    // This method is only used in appmarket frontend, so no need to implement this for other applications
    return null
  }
  const environmentUrls = getRuntimeConfig()._urls

  return (
    environmentUrls[isDevPortal ? 'devPortalDocumentation' : 'documentation'] ||
    `https://documentation.${getRuntimeConfig()._brand}.com`
  )
}

function getAlexaKBArticle () {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`This method 'getAlexaKBArticle' is deprecated and will be removed in core-utils 4.0.0`)
  }
  const runtimeConfig = getRuntimeConfig()
  if (runtimeConfig.version === 2) {
    return getHelpAndTerms('learnMoreAlexa')
  }
  return runtimeConfig._urls.learn_more_alexa
}

function getDataProxyUrl () {
  const runtimeConfig = getRuntimeConfig()
  if (runtimeConfig.version === 2) {
    return getBaseUrl('dataproxy')
  }
  return runtimeConfig._urls.dataproxy
}

function hasCPKnowledgeBase () {
  return getHelpUrl().indexOf('.') === -1
}

function buildQueryString (params) {
  return isEmpty(params)
    ? ''
    : reduce(
      params,
      (result, value, key) => (result === '?' ? `${result}${key}=${value}` : `${result}&${key}=${value}`),
      '?'
    )
}
function getLoginUrl (options = {}) {
  let url
  // check for if a product is specified, if so we run the login with a custom product name
  if (getRuntimeConfig()._product === 'store') {
    return '/session/expired'
  } else if (getRuntimeConfig()._loginProduct) {
    if (getRuntimeConfig()._loginProduct === 'crm') {
      return getBaseUrl(siteNames.CRM) + '/login' + window.location.search + '?destination=' + window.location.href
    }
    url = getBaseUrl(siteNames.LOGIN) + `/${getRuntimeConfig()._loginProduct}/login` + window.location.search
  } else {
    const params = getQueryParametersFromUrl(window.location.href)
    const returnUrl = get(options, 'returnUrl', window.location.href)
    params.returnUrl = returnUrl

    url = getUrl(siteNames.LOGIN, '/login')

    // TODO, this is a temporary fix for hosted brands because the login url is undefined and the base url dynamic
    // Redirect to main domain
    if (url === '/login') {
      return 'https://' + getDomainForHostedBrand()
    }
    url = addQueryParamtersToUrl(url, params)
  }

  return url
}

/**
 * same as getUrl but instead of giving the site name the site name is included in the url
 * example url = {api}/v1.0/something  or url = {app_market_api}/v1.0/somethingelse
 * this way can dynamicly define which api to use
 * also works for absolute urls
 */
function resolveUrl (fallBackSiteName, url, options, params) {
  if (!url) {
    return url
  }
  if (url.indexOf('http') === 0) {
    return url
  }

  if (url[0] === '{') {
    const matches = url.match(/{(.+?)}/)
    if (matches) {
      return getUrl(matches[1], url.substr(matches[0].length), options, params)
    }
  }
  if (url[0] !== '/') {
    url = '/' + url
  }

  return getUrl(fallBackSiteName, url, options, params)
}

/**
 * Formats the url with the data from the configuration settings
 * You can specify the product and sitename,
 * @example
 * // will return the mail.{url}.com domain
 * getProductUrl(productNames.EMAILMARKETING, 'editor')
 * @example
 * // will return the designer.{url}.com domain
 * getProductUrl(productNames.RESPONSIVEEDITOR, 'editor')
 * @param {string} productName use productNames.{any}
 * @param {string} siteName use siteNames.{any}
 * @param {string} path Will be appended after the base url
 * @param {object} params, will be used to make param strings. The url is followd by '?' and the param object is concated like jquery.param function
 * @returns {string} The formatted url
 */
function getProductUrl (productName, siteName, path = '', params) {
  const url = getBaseUrl(siteName, productName) + path

  // if URL is still not ok.
  if (!url) {
    throw Error(`BaseUrl not found, please check app-config.js. ProductName: ${productName} / SiteName: ${siteName}`)
  }

  return params ? `${url}?${param(params)}` : url
}

/**
 * format the url, includes base url
 *
 * @function
 * @param {any} sitename, use siteNames.{any}
 * @param {string} path, this will be appended after the base url
 * @param {object} options, options.useCdn available for caching
 * @param {object} params, will be used to make param strings. The url is followd by '?' and the param object is concated like jquery.param function
 * @returns {string} formated url
 *
 * @memberOf UrlHelper
 */
function getUrl (sitename, path = '', options, params) {
  let url
  if (options && options.useCdn) {
    // Check if there is a cdn url available for the sitename, otherwise return normal url
    const cdnSiteName = convertSiteNameToCdnSiteName(sitename)
    const cdnUrl = getBaseUrl(cdnSiteName)

    if (!isEmpty(cdnUrl)) {
      // get the correct cache hash, ? or &
      const cacheStr = getCacheStr(path)
      return params ? `${cdnUrl}${path}${cacheStr}&${param(params)}` : `${cdnUrl}${path}${cacheStr}`
    }
  }
  if (!url) {
    url = getBaseUrl(sitename) + path

    // if URL is still not ok.
    if (!url) {
      const obj = {
        error: `BaseUrl not found, please check config.js. Sitename: ${sitename}`
      }
      throw obj
    }
  }

  return params ? `${url}?${param(params)}` : url
}

/**
 * Convert normal sitename to the cdn sitename
 *
 * @function
 * @param {string} sitename
 * @returns {string} cdn sitename
 *
 * @memberOf UrlHelper
 */
function convertSiteNameToCdnSiteName (sitename) {
  return `${sitename}_cdn`
}

function getUrlsFromCurrentEnvironment () {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`This method 'getUrlsFromCurrentEnvironment' is deprecated and will be removed in core-utils 4.0.0`)
  }
  const runtimeConfig = getRuntimeConfig()
  if (runtimeConfig.version === 2) {
    // This method is not used, so no need to implement this
    return null
  }

  return getRuntimeConfig()._urls
}

function convertSiteNameToNonCdnUrl (url) {
  const runtimeConfig = getRuntimeConfig()
  if (runtimeConfig.version === 2) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `This method 'convertSiteNameToNonCdnUrl' is not supported for Runtime 2.0 (deprecated after moving to app-gateway). Returning false`
      )
    }
    return false
  }

  const urls = runtimeConfig._urls
  const knownUrls = pick(urls, keys(urls).filter(x => x.indexOf('_cdn') !== -1))
  const pair = pickBy(knownUrls, path => url.indexOf(path) !== -1)
  const key = first(keys(pair))

  let nonCdnBaseUrl
  if (key) {
    nonCdnBaseUrl = getBaseUrl(replace(key, '_cdn', ''))
  } else {
    nonCdnBaseUrl = getBaseUrl(siteNames.API)
  }

  return replace(url, pair[key], nonCdnBaseUrl)
}

function isKnownCdnUrl (url) {
  const runtimeConfig = getRuntimeConfig()
  if (runtimeConfig.version === 2) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[${url}]: This method 'isKnownCdnUrl' is not supported for Runtime 2.0 (deprecated after moving to app-gateway). Returning false`
      )
    }
    return false
  }

  const urls = runtimeConfig._urls
  const knownUrls = values(pick(urls, keys(urls).filter(x => x.indexOf('_cdn') !== -1)))
  return !isEmpty(knownUrls.find(path => url.indexOf(path) !== -1))
}

function getDomainForHostedBrand () {
  // Strip port
  let hostedDomain = document.location.host.split(':')[0]
  hostedDomain = hostedDomain.split('.')

  if (getRuntimeConfig()._env !== 'prod') {
    if (document.location.hostname.includes(MYWEBSITEBUILDER_BASE_URL)) {
      // Include latest, qa, uat
      // Return latest.domain.com
      return hostedDomain.slice(hostedDomain.length - 3).join('.')
    }
  }
  // Return domain.com
  return hostedDomain.slice(hostedDomain.length - 2).join('.')
}

/**
 * Get the string you can append to avoid cache,
 *
 * @function
 * @param {string} path, we will check if this url contains ? or &
 * @returns {string} no cache hash, that you can append in the url
 *
 * @memberOf UrlHelper
 */
function getCacheStr (path) {
  if (path.indexOf('?') !== -1) {
    // eslint-disable-next-line no-undef
    return `&hash=${__webpack_hash__}`
  } else {
    // eslint-disable-next-line no-undef
    return `?hash=${__webpack_hash__}`
  }
}

function getAuthenticationUrl (params) {
  let url = getRuntimeConfig()._authentication_api
  const app = getRuntimeConfig()._app
  if (app === 'app-admin') {
    url = siteNames.MANAGEMENT_API
  } else if (app === 'app-store-editor') {
    url = siteNames.STORE_EDITOR_API
  } else if (app === 'app-store-shop') {
    url = siteNames.STORE_SHOP_API
  } else if (app === 'app-logo-builder') {
    url = siteNames.LOGO_API_LOGIN
  } else if (app === 'app-designer' || app === 'app-mail') {
    url = siteNames.RE_API
  }
  return getUrl(url, params)
}

function param (obj) {
  let result = ''
  for (const key in obj) {
    result += `${key}=${encodeURIComponent(obj[key])}&`
  }
  return result.substr(0, result.length - 1)
}

function addQueryParamtersToUrl (url, queries) {
  let queryString = ''

  for (const query in queries) {
    queryString += `&${query}=${encodeURIComponent(queries[query])}`
  }
  if (url.indexOf('?') === -1 && !isEmpty(queries)) {
    queryString = queryString.replace(queryString.charAt(0), '?')
  }

  return url + queryString
}

/**
 * Find query parameters in an url
 *
 * @function
 * @param {string} url, we will check if this url contains query parameters
 *
 * @memberOf UrlHelper
 */
export function getQueryParametersFromUrl(url, toLowerCase) {
  if (!url || (url.indexOf('?') === -1 && url.indexOf('&') === -1)) {
    return {}
  }

  const search = url.split('?').pop()
  if (!search) {
    return {}
  }

  return search.split('&').reduce((prev, curr, i, arr) => {
    const p = curr.split('=')
    const key = p[0]
    // Only need to split on the first '=' because a value can contain a '='
    const value = p.slice(1).join('=')
    const decodedKey = decodeURIComponent(key)
    prev[toLowerCase ? decodedKey.toLocaleLowerCase() : decodedKey] = decodeURIComponent(value)
    return prev
  }, {})
}

function redirectToReferrer (url) {
  // decode urls before we do a redirect
  url = decodeURIComponent(url)

  if (url) {
    window.location.href = url
    return
  }

  const parameters = getQueryParametersFromUrl(window.location.search)
  if (parameters.destination) {
    window.location.href = parameters.destination
  } else if (window.document.referrer && window.document.referrer.indexOf('login') === -1) {
    window.location.href = window.document.referrer
  }
}
/**
 * checkHashRedirect
 * We can retieve a hash with a brandname from our url
 * (note: this always assumes hash-brandName)
 * @param {string} hashFromUrl instanceof window.location.hash
 * @param {string} hasNeedle is the has string we are looking for in the hash (i.e: "#cons-")
 * @param {func} callback will be called with the brand name
 */
function checkHashRedirect (hashFromUrl, hasNeedle, callback) {
  const hash = hashFromUrl || window.location.hash
  const hasNeeded = hasNeedle
  if (hasNeeded.indexOf(hash)) {
    const redirectedFrom = hash.split(hasNeeded)
    if (typeof redirectedFrom[1] === 'string') {
      const brandName = redirectedFrom[1].replace('-', ' ')
      callback(brandName.toLowerCase())
    }
  }
}

/**
 * You can use this function to get the url for the app-gateway.
 * Define _defaultApiName in the runtime-config variables to set the default api name
 *
 * @example
 * api('system/status') // https://app-gateway.sitebuilder.latest.wzdev.co/email-marketing/system/status
 * api('system/status', 'logos') // https://app-gateway.sitebuilder.latest.wzdev.co/logos/system/status
 * api('') // https://app-gateway.sitebuilder.latest.wzdev.co/email-marketing/
 * api() // https://app-gateway.sitebuilder.latest.wzdev.co/email-marketing/
 * api('/test') // https://app-gateway.sitebuilder.latest.wzdev.co/email-marketing/test
 * api('/test', null, { 'query': 'string'}) // https://app-gateway.sitebuilder.latest.wzdev.co/email-marketing/test?query=string
 * @param {string} path This is the part behind the hostname
 * @param {string} name Optional. You can use this to override the default api name
 * @param {object} params Optional. You can use this to pass in an object and every key will be added as a query param
 * @returns {string}
 */
export const api = (path, name, params) => {
  if (isEmpty(name)) {
    name = getRuntimeConfig()._defaultApiName
  }
  if (!isEmpty(path)) {
    if (path[0] === '/') {
      path = path.slice(1)
    }
  }
  if (isNil(path)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('UrlHelper - api - Please pass a path to the api function')
    }
    path = ''
  }

  // Build the url. Example: https://app-gateway.sitebuilder.latest.wzdev.co/email-marketing/system/status
  const url = `${getRuntimeConfig()._brandedUrls.app_gateway.api}/${name}/${path}`

  if (!params) {
    return url
  }

  return `${url}${url.indexOf('?') === -1 ? '?' : '&'}`
}

export {
  checkHashRedirect,
  redirectToReferrer,
  addQueryParamtersToUrl,
  param,
  getAuthenticationUrl,
  getCacheStr,
  isKnownCdnUrl,
  convertSiteNameToNonCdnUrl,
  getUrlsFromCurrentEnvironment,
  convertSiteNameToCdnSiteName,
  getDomainForHostedBrand,
  getProductUrl,
  getUrl,
  resolveUrl,
  getLoginUrl,
  buildQueryString,
  hasCPKnowledgeBase,
  getDataProxyUrl,
  getAlexaKBArticle,
  getDocumentationUrl,
  getHelpUrl,
  getSupportUrl,
  getKBUrl,
  getTermsUrl,
  shouldUseOwnDomain,
  getPublicUrl,
  getBrandName,
  getHostName,
  getBaseUrl,
  hostNameSites,
  globalStoreLocale,
  setGlobalStoreLocale,
  setGlobalInstanceJwt,
  globalInstanceJwt,
  setStoreBrandFromQs,
  storeBrandFromQs,
  setGlobalStoreToken,
  globalStoreToken,
}
