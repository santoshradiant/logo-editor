import { setRuntimeConfig } from '@eig-builder/core-utils/helpers/runtime-config-helper'

const mockRuntimeConfig = () => {
  beforeEach(() => {
    setRuntimeConfig({})
  })

  return {
    mock: runtimeConfig => {
      setRuntimeConfig(runtimeConfig)
    }
  }
}

export default mockRuntimeConfig
