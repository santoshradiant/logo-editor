import { useState, useContext, useMemo } from 'react'
import { AppSetupContext } from '@eig-builder/module-app-setup'

import useLogoAccountLimitations from 'hooks/useLogoAccountLimitations'

const useLogoLimit = baseName => {
  const { isOPN } = useContext(AppSetupContext)
  const [showModal, setShowModal] = useState(false)
  const limitationResponse = useLogoAccountLimitations()

  const canCreateLogo = () => {
    if (!isOPN) return true
    if (!limitationResponse.data) return false
    const {
      logos_created_max: { current, limit }
    } = limitationResponse.data
    if (limit !== 0 && !limit) return true
    return current < limit
  }

  const goToCreateLogo = (goToWithHistory) => {
    if (canCreateLogo()) {
      window.navigationState.drawer.next(false)
      window.navigationState.header.next(false)
      goToWithHistory( `${baseName}/onboarding`)
    } else {
      setShowModal(true)
    }
  }

  const goToLogos = goToWithHistory => {
    goToWithHistory( '/logo')
  }

  const shouldDisable = useMemo(() => {
    return !limitationResponse.data && isOPN
  }, [limitationResponse.data, isOPN])

  return {
    showModal,
    setShowModal,
    goToCreateLogo,
    isOPN,
    limitationResponse,
    canCreateLogo,
    goToLogos,
    shouldDisable
  }
}

export default useLogoLimit
