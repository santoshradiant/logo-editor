import React from 'react'
import PropTypes from 'prop-types'

import { Stepper } from '@eig-builder/module-brandkit'
import Create from 'modules/logo-mfe/components/onboarding'
import LogoSelection from 'modules/logo-mfe/components/logo-selection'
import ColorSelection from 'modules/logo-mfe/components/color-selection'
import LogoMFEWrapper, { useLogoMFEContext } from './context/logo-mfe-context'
import './lang'

const LogoMFE = () => {
  const { state, updateProperty } = useLogoMFEContext()
  const steps = [
    {
      component: Create
    },
    {
      component: LogoSelection
    },
    {
      component: ColorSelection
    }
  ]

  React.useEffect(() => {
    updateProperty('steps', steps)
  }, [])

  return <Stepper steps={steps} activeStep={state.activeStep} />
}

const HOC = ({ goBack }) => {
  return (
    <LogoMFEWrapper goBack={goBack}>
      <LogoMFE />
    </LogoMFEWrapper>
  )
}
HOC.propTypes = {
  goBack: PropTypes.any
}
export default HOC
