import { performFetch } from '@eig-builder/core-utils/fetch'
import { api } from '@eig-builder/core-utils/helpers/url-helper'

const TemporaryLogosClient = {
  getTemplateData: async id => performFetch(api(`v1.0/temporary-logos/${id}/load`)).then(({ logo }) => JSON.parse(logo))
}

export default TemporaryLogosClient
