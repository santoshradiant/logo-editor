import React, { memo } from 'react'
import { styled } from '@mui/material/styles'
// import BottomNavigationBarWithProgress from '@eig-builder/compositions-bottom-navigation-bar-with-progress'
import PropTypes from 'prop-types'

import Text from '@eig-builder/module-localization'
import '../containers/lang'
import { useStepperContext, StepContext } from '@eig-builder/module-stepper'

import { DataElementLocations } from '@eig-builder/core-utils/helpers/tagging-helper'
import { useOnboardingContext } from '../context/onboarding-context'
import LinearProgress from '@mui/material/LinearProgress';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import { Button } from '@mui/material'

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  marginBottom: -1,
  '&.MuiLinearProgress-colorPrimary': {
    backgroundColor: 'transparent!important',
  },
}));

const BottomNavigationBarWithProgress = ({ progress, previous, next }) => {
  return (
    <Box sx={{ pb: 2 }}>
      <Box>
        {progress && (
          <StyledLinearProgress
            variant="determinate"
            value={(progress.step / progress.steps) * 100}
          />
        )}
        <Divider />
      </Box>
      <Box sx={{ pt: 2, display: 'flex', justifyContent: 'end' }}>
        <Box sx={{ pr: 2 }}>{previous}</Box>
        <Box sx={{ pr: 2 }}>{next}</Box>
      </Box>
    </Box>
  );
};

BottomNavigationBarWithProgress.propTypes = {
  progress: PropTypes.shape({
    steps: PropTypes.number,
    step: PropTypes.number,
  }).isRequired,
  next: PropTypes.element,
  previous: PropTypes.element,
};


const StyledBottomNav = styled('div')`
  max-width: 100vw;
  height: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 13000000;
`

const BottomNavWithProgress = props => {
  const stepContext = React.useContext(StepContext)
  const stepperContext = useStepperContext()

  const onboardingContext = useOnboardingContext()

  const showFishButton = stepContext.isFinalStep
  const step = parseInt(stepContext.currentStep.path)
  const steps = parseInt(stepContext.totalSteps)

  return (
    <StyledBottomNav onClick={(e)=> e.stopPropagation()}>
      <BottomNavigationBarWithProgress
        progress={{
          step,
          steps
        }}
        next={
          <Button
            color='primary'
            variant='contained'
            onClick={() => {
              stepperContext.navigateToNextStep()
            }}
            disabled={!onboardingContext.continueButtonActive}
            dataElementLocation={DataElementLocations.LEFT_RAIL}
            dataElementLabel='logo-onboarding-sidebar-footer-next-button'
            dataElementId='logo-onboarding-sidebar-footer-next-button'
          >
            {showFishButton ? (
              <Text message='modules.onboarding.footer.finish' />
            ) : (
              <Text message='modules.onboarding.footer.continue' />
            )}
          </Button>
        }
        previous={
          stepContext.shouldDisplayBackIcon &&
          step > 1 && (
            <Button
              variant='text'
              color='default'
              onClick={stepperContext.navigateToPreviousStep}
              dataElementLocation={DataElementLocations.LEFT_RAIL}
              dataElementLabel='logo-onboarding-sidebar-footer-previous-button'
              dataElementId='logo-onboarding-sidebar-footer-previous-button'
            >
              <Text message='modules.onboarding.footer.previous' />
            </Button>
        )
        }
      />
    </StyledBottomNav>
  )
}

BottomNavWithProgress.propTypes = {
  history: PropTypes.object
}

export default memo(BottomNavWithProgress)
