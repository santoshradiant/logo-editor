import { performFetch } from 'helpers/utils'
import AuthUjwtHelper from 'helpers/auth-ujwt-helper'

import { getUjwt } from './../api-config'

const Ids4Client = {
  getUjwt: async () =>
    performFetch(await getUjwt().url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${await AuthUjwtHelper.getToken()}` }
    })
}

export default Ids4Client
