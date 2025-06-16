import { performFetch } from '@eig-builder/core-utils/fetch'
import { api } from '@eig-builder/core-utils/helpers/url-helper'

const OnboardingInfoClient = {
  getOnboardingInfo: onboardingGuid => performFetch(api(`v1.0/onboarding/${onboardingGuid}`))
}

export default OnboardingInfoClient
