import OnboardingSteps from '../config/onboarding-steps'
import React from 'react'
import { useOnboardingContext } from '../../context/onboarding-context'

const SideBar = () => {
  const { state } = useOnboardingContext()
  const { content: OnboardingContent } = OnboardingSteps[state.currentStep]

  return (
    <div>
      <OnboardingContent />
    </div>
  )
}

export default SideBar
