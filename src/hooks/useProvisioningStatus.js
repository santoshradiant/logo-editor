import { useContext } from 'react'
import { useQuery } from 'react-query'
import isNil from 'lodash/isNil'

import LimitationsClient from 'clients/limitations.client'
import { AppSetupContext } from '@eig-builder/module-app-setup'
import { getRuntimeConfig } from '@eig-builder/core-utils/helpers/runtime-config-helper'

const cacheKey = 'provisioning-status'

const useProvisioningStatus = () => {
  const { isOPN } = useContext(AppSetupContext)

  const opnUpsellEnabled = !!getRuntimeConfig()?._settings?.opn?.upsell

  const { data, isLoading } = useQuery([cacheKey], _ => LimitationsClient.getProvisioningStatus(), {
    enabled: !isNil(isOPN) && opnUpsellEnabled,
    refetchOnWindowFocus: false
  })

  return {
    data,
    isLoading
  }
}

export default useProvisioningStatus
