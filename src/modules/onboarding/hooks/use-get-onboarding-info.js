import { useQuery } from '@tanstack/react-query'
import OnboardingInfoClient from 'clients/onboarding-info.client'
import isNil from 'lodash/isNil'

/*
 * Users can be on-boarded with preset data,
 * For example we already know the user's brand name or color pallette.
 * over here we get the us
 */
const useGetOnboardingInfo = id => {
  const onboardingInfo = useQuery({
    queryKey: ['onboarding-info', id],
    queryFn: ({ queryKey: [_, onboardingGuid] }) => OnboardingInfoClient.getOnboardingInfo(onboardingGuid),
    enabled: !isNil(id) }
  )
  return onboardingInfo
}

export default useGetOnboardingInfo
