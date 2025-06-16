import React, { memo } from 'react'
import PropTypes from 'prop-types'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Text from '@eig-builder/module-localization'
import CardContent from '@mui/material/CardContent'
import NoLogoSvg from './images/no-logo.svg'
import { goToWithHistory } from '@eig-builder/core-utils/helpers/go-to-helper'
import { useApplicationContext } from 'modules/application-config'
import { Container } from './views'
import './lang'
import { useNavigate } from 'react-router'

const OnboardingLink = () => {
  const { baseName } = useApplicationContext()
  const navigate = useNavigate()
  const onClick = () => goToWithHistory(navigate, baseName + '/onboarding')
  return (
    <Container>
      <Card>
        <CardContent className='p-3'>
          <Grid container direction='column' sx={{ alignItems: 'center' }}>
            <Grid size='auto' className='p-3'>
              <img src={NoLogoSvg} alt='' />
            </Grid>
            <Grid size='auto'>
              <Typography variant='body1'>
                <Text message='modules.onboarding.link.body' />
              </Typography>
            </Grid>
            <Grid size='auto' className='p-3'>
              <Button onClick={onClick}>
                <Text message='modules.onboarding.link.cta' />
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  )
}

OnboardingLink.propTypes = {
  history: PropTypes.object.isRequired
}

export default memo(OnboardingLink)
