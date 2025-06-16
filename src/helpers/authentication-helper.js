import { postAsJson, setGlobalModifyHeader, fetchAsJson } from '@eig-builder/core-utils/helpers/fetch-helper'
import {
  api,
  globalStoreToken,
  globalInstanceJwt,
  globalStoreLocale,
  setGlobalStoreToken
} from '@eig-builder/core-utils/helpers/url-helper'
import Store from '@eig-builder/core-utils/store'
import { bindActionCreators } from 'redux'
import has from 'lodash/has'
import isEmpty from 'lodash/isEmpty'
import { getRuntimeConfig } from '@eig-builder/core-utils/helpers/runtime-config-helper'
export * from '@eig-builder/module-authentication'
export const GET_CURRENT_USER = 'GET_CURRENT_USER'
export const GET_CURRENT_USER_FULFILLED = 'GET_CURRENT_USER_FULFILLED'
export const GET_CURRENT_USER_ERROR = 'GET_CURRENT_USER_ERROR'
export const GET_CURRENT_USER_PENDING = 'GET_CURRENT_USER_PENDING'
export const GET_XSRF_TOKEN = 'GET_XSRF_TOKEN'
export const GET_REFRESH_TOKEN = 'GET_REFRESH_TOKEN'
export const UPDATE_LIMITATION = 'UPDATE_LIMITATION'
export const GET_LIMITATIONS = 'GET_LIMITATIONS'
export const DISABLE_FEATURE_FLAG = 'DISABLE_FEATURE_FLAG'
export const ENABLE_FEATURE_FLAG = 'ENABLE_FEATURE_FLAG'
export const UPDATE_FEATURE_FLAG = 'UPDATE_FEATURE_FLAG'
export const GET_XSRF_TOKEN_FULFILLED = 'GET_XSRF_TOKEN_FULFILLED'
/**
 * Authentication helper - Used to check if the users is logged in on the server or when a user wants to logout
 *
 * @class AuthenticationHelper
 */
class AuthenticationHelper {
  static loginTime = 10000
  static isAuthenticated = false

  // constructor () {
  //   AuthenticationHelper.isAuthenticated = false
  // }

  static _refreshToken() {
    return postAsJson(api('/v1.0/token/refresh'), undefined, {
      key: GET_REFRESH_TOKEN,
      dontShowErrorsInNotificationBar: true,
      appendPromise: (response) => AuthenticationHelper._validateAuthResponse(response, true)
    })
  }

  static _getXSRFToken() {
    return postAsJson(
      api('/v1.0/token/preauth'),
      {},
      {
        key: GET_XSRF_TOKEN
      }
    )
  }

  /**
   * validate auth response to check if we have to start the refresh token routine
   *
   * @param {any} response promise
   * @returns response promise
   *
   * @memberOf AuthenticationHelper
   */
  static _validateAuthResponse(response, isTokenRefresh) {
    AuthenticationHelper.isAuthenticated = response.response.status === 200
    if (response.data) {
      try {
        const obj = JSON.parse(response.data)
        AuthenticationHelper.expiresIn = obj['expires_in']
        AuthenticationHelper.storeId = obj['store_id']
        AuthenticationHelper.currency = obj['currency']
        if (isTokenRefresh && !AuthenticationHelper.storeId) {
          // Something failed on refresh -> bail to login.
          window.location.href = AuthenticationHelper.getLoginRedirectUrl()
          return
        }

        // just is used for local debugging. it will create a new stoken every time your refresh. this allows us to debug forever
        if (has(obj, 'jwt_token')) {
          setGlobalModifyHeader((header) => {
            header['Authorization'] = `Bearer ${obj['jwt_token']}`
          })
          setGlobalStoreToken(obj['jwt_token'])
        }
        if (AuthenticationHelper.expiresInTimeout) {
          clearTimeout(AuthenticationHelper.expiresInTimeout)
        }

        AuthenticationHelper.expiresInTimeout = setTimeout(() => {
          AuthenticationHelper.refreshToken()
        }, AuthenticationHelper._convertToMiliseconds(AuthenticationHelper.expiresIn))
      } catch (error) {
        // refresh token failed, should be picked up by GET_REFRESH_TOKEN_ERROR
        console.error(error)
      }
    }
    return response
  }

  /**
   * Convert seconds to miliseconds, readability
   *
   * @param {number} seconds
   * @returns miliseconds
   *
   * @memberOf AuthenticationHelper
   */
  static _convertToMiliseconds(seconds) {
    return seconds * 1000
  }

  /**
   * Autmoaticly called by the timed refreshtoken routine, this will get a new token from the server
   *
   * @memberOf AuthenticationHelper
   */
  static refreshToken() {
    if (
      AuthenticationHelper.isAuthenticated &&
      AuthenticationHelper.expiresIn &&
      AuthenticationHelper.expiresInTimeout
    ) {
      const actions = bindActionCreators({ refreshToken: AuthenticationHelper._refreshToken }, Store().dispatch)
      actions.refreshToken()
    }
  }

  /**
   * Check if the user is authenticated at the server
   *
   * @param {any} options, must have a key
   * @returns fetch promise
   *
   * @memberOf AuthenticationHelper
   */
  static checkAuth(options) {
    return async function (dispatch, getState) {
      if (AuthenticationHelper.skipMe) {
        return { payload: {} }
      }

      try {
        let url
        let storeToken
        // make sure that we a have a token. if we dont try to fetch a token with the instance jwt
        if (isEmpty(globalStoreToken)) {
          if (globalInstanceJwt) {
            url = api('/v1.0/appmarket-jwt/rewrite', 'store-edit', {
              instanceJwt: globalInstanceJwt,
              locale: globalStoreLocale
            })

            const data = await fetchAsJson(url, {
              key: 'GET_STORE_AUTH_TOKEN_NOT_APPMARKET_TOKEN',
              simpleCall: true
            })(dispatch, getState)

            storeToken = data.payload.token
            storeToken && window.sessionStorage.setItem('storeToken', storeToken)

            // We dont need this anymore This is fixed on the /home and the /setup page
            // if (data.payload.redirect_to_onboarding_flow) {
            //   window.location.href = '/store/create?token=' + storeToken + '&locale=' + globalStoreLocale + '&brand=' + storeBrandFromQs
            //   AuthenticationHelper.skipMe = true
            //   return { payload: {} }
            // }
          } else {
            storeToken = window.sessionStorage.getItem('storeToken')
          }

          setGlobalModifyHeader((header) => {
            header['Authorization'] = `Bearer ${storeToken}`
          })

          setGlobalStoreToken(storeToken)
        }

        url = api('/v1.0/token/me')
        // localhost debugging, use a different auth url
        if (process.env.isProd !== true && getRuntimeConfig()._localStoreInstanceId) {
          const brand = getRuntimeConfig()._brandDisplayName && getRuntimeConfig()._brandDisplayName.replace(/\s/g, '')
          url = api(
            `/v1.0/token?instanceId=${encodeURIComponent(getRuntimeConfig()._localStoreInstanceId)}&brand=${brand}`
          )
        }

        const data2 = await fetchAsJson(url, {
          key: options.key,
          // skipCredentials: getRuntimeConfig()._appName === 'app-admin', // We skip the auth credentials for CORS with Management portal integration
          simpleCall: process.env.isProd !== true,
          appendPromise: (response) => AuthenticationHelper._validateAuthResponse(response),
          onException: function (error) {
            if (error && error.message === 'TypeMismatchError') {
              AuthenticationHelper.getXSRFToken()
            }

            Store().dispatch({
              type: `${options.key}_ERROR`,
              name: 'error'
            })
          }
        })(dispatch, getState)

        return data2
      } catch (ex) {
        Store().dispatch({
          type: `${options.key}_ERROR`,
          name: 'error'
        })

        console.error('some auth error', ex)

        return {}
      }
    }
  }

  static getXSRFToken = () => {
    const actions = bindActionCreators({ getXSRFToken: AuthenticationHelper._getXSRFToken }, Store().dispatch)
    actions.getXSRFToken()
  }

  static getLoginRedirectUrl() {
    return '/session/expired'
  }
}

export default AuthenticationHelper
