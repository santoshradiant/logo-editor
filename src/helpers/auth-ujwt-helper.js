import { jwtDecode } from 'jwt-decode'
import moment from 'moment'

import Ids4Client from 'clients/ids4.client'

class AuthUjwtHelper {
  constructor () {
    this.token = null
    this.expiryDate = null
    this.refreshCallback = null
    this.refreshPromise = null
  }

  setRefreshCallback = callback => {
    this.refreshCallback = callback
  }

  setToken = token => {
    this.token = token
  }

  monitorToken = async () => {
    if (this.refreshPromise) {
      await this.refreshPromise
    }
  }

  getToken = async () => {
    await this.monitorToken()
    if (!this.token) {
      return this.retrieveAuthToken()
    }
    if (!this.expiryDate) {
      this.expiryDate = this.getExpiryDate(this.token)
    }

    if (this.isExpired()) {
      return this.retrieveAuthToken()
    }
    return this.token
  }

  checkAuth = async () => {
    let res = await this.getToken()

    try {
      // check if ujwt, if it is, then just return that
      if (res) {
        const { iss: issuer } = jwtDecode(res)
        if (issuer !== 'SiteBuilderIssuer') {
          return res
        }
      }
      // otherwise, it's probably a cptoken so we need to get a ujwt
      res = await Ids4Client.getUjwt()
      if (!res?.ujwt) {
        // throw error
        throw new Error('No ujwt found')
      } else {
        res = res.ujwt
      }
    } catch (error) {
      console.error(error)
    }
    this.token = res
    return res
  }

  isExpired = () => this.expiryDate && this.expiryDate <= moment().unix()

  retrieveAuthToken = async () => {
    if (!this.refreshCallback) {
      console.warn('A callback to refresh the auth token must be set when initializing the MFE')
      return
    }

    if (!this.refreshPromise) {
      this.refreshPromise = new Promise(async resolve => {
        const newToken = await this.refreshCallback()
        this.token = newToken
        this.expiryDate = this.getExpiryDate(this.token)
        resolve()
      })
    }

    await this.refreshPromise
    this.refreshPromise = null
    return this.token
  }

  decodeToken = token => {
    const decoded = jwtDecode(token)
    return decoded
  }

  getExpiryDate = token => {
    if (token) {
      const { exp: expiryDate } = this.decodeToken(token)

      if (expiryDate) {
        return expiryDate
      }

      return null
    }
  }
}

export default new AuthUjwtHelper()
