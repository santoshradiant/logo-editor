import React, { memo, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import useGetOnboardingInfo from 'modules/onboarding/hooks/use-get-onboarding-info'

import { styled } from '@mui/material/styles'
import { useNavigate, withRouter } from 'react-router'

import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
// Helpers
import { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery'
import { goToWithHistory } from '@eig-builder/core-utils/helpers/go-to-helper'
import Typography from '@mui/material/Typography'

import Text from '@eig-builder/module-localization'
import './lang'

import { DataElementLocations } from '@eig-builder/core-utils/helpers/tagging-helper'
import isEmpty from 'lodash/isEmpty'

import TextField from '@mui/material/TextField'
import { useApplicationContext } from 'modules/application-config/index'

import ErrorDialog from 'logomaker/components/error-dialog'

import { getQueryParametersFromUrl } from '@eig-builder/core-utils/helpers/url-helper'

const BoardingContainer = styled('div')`
  max-width: 730px;
  margin: 0 auto;
  padding-right: 16px;
  padding-left: 16px;
`

const StyledBoardingContainer = styled(BoardingContainer)`
  max-width: 854px;
  padding-top: 20px;
`

const TextfieldWithMaxLength = styled(TextField)`
  p {
    text-align: right;
  }
`

const InformationQuestionsPage = () => {
  const sloganFieldRef = useRef()
  const navigate = useNavigate()
  const [className, setClassName] = useState('wrapper-inputfields')
  const [slogan, setSlogan] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [openEEDialog, setOpenEEDialog] = useState(false)

  const { baseName } = useApplicationContext()
  const params = getQueryParametersFromUrl(window.location.href)

  const onboardingInfo = useGetOnboardingInfo(params.editor)

  useEffect(() => {
    if (!isEmpty(onboardingInfo.data)) {
      if (onboardingInfo.data.name && onboardingInfo.data.name.length > 2) {
        setCompanyName(onboardingInfo.data.name)
        setClassName('wrapper-inputfields slogan--show')
      } else {
        setOpenEEDialog(true)
      }

      if (onboardingInfo.data.slogan) {
        setSlogan(onboardingInfo.data.slogan)
      }
    }
  }, [onboardingInfo.data, onboardingInfo.data.name, onboardingInfo.data.slogan])

  const postForm = () => {
    const escapedCompanyName = encodeURIComponent(companyName)
    const escapedSlogan = encodeURIComponent(slogan)

    const uri = `${baseName}/selection/${escapedCompanyName}/${escapedSlogan}`
    goToWithHistory(navigate, uri)
  }

  const onChangeSlogan = (e) => {
    setSlogan(e.target.value)
  }

  const getHelperText = () => {
    const value = companyName
    const max = 40
    const helperText = 30

    if (value && value.length >= helperText) {
      return `${value.length}/${max}`
    }
  }

  const setBrandName = (e) => {
    if (e.target.value.length <= 40) {
      setCompanyName(e.target.value)
    }
    if (e.target.value.length && e.target.value.length > 0) {
      setClassName('wrapper-inputfields slogan--show')
    } else {
      setClassName('wrapper-inputfields')

      if (slogan.length > 0) {
        setSlogan('')
      }
    }
  }

  const isMobile = useIsMobile()
  const spacing = isMobile ? '20px' : '45px'

  return (
    <StyledBoardingContainer>
      <Card>
        <Typography className='px-3' variant='h2' align='center' style={{ marginTop: spacing }}>
          <Text message='modules.onboarding.containers.information.header' />
        </Typography>
        <Typography className='px-3' variant='subtitle2' gutterBottom align='center'>
          <Text message='modules.onboarding.containers.information.subtitleRebrand' />
        </Typography>
        <form onSubmit={postForm}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid size={12}>
                <div className={className}>
                  <TextfieldWithMaxLength
                    className='mt-2 mb-2'
                    fullWidth
                    autoFocus
                    variant='outlined'
                    onChange={setBrandName}
                    label={<Text message='modules.onboarding.containers.information.brandName' />}
                    value={companyName}
                    helperText={getHelperText()}
                    inputProps={{
                      'data-test-id': 'brand-name-button'
                    }}
                  />

                  <TextField
                    variant='outlined'
                    fullWidth
                    onChange={onChangeSlogan}
                    value={slogan}
                    label={<Text message='modules.onboarding.containers.information.slogan' />}
                    inputRef={sloganFieldRef}
                    inputProps={{
                      'data-test-id': 'slogan-button'
                    }}
                  />
                </div>
              </Grid>
              <Grid container direction='row' sx={{ justifyContent: 'center', alignItems: 'center' }} spacing={2}>
                <Grid>
                  <Button
                    className='mt-4'
                    type='submit'
                    variant='contained'
                    disabled={!companyName || companyName.length < 2}
                    color='primary'
                    dataElementLocation={DataElementLocations.BODY}
                    dataElementLabel='logo-create-button'
                    dataElementId='logomaker-creation-logo-create-button'
                    data-test-id='create-logo-button'
                  >
                    <Text message='modules.onboarding.containers.information.cta' />
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </form>
      </Card>
      <ErrorDialog
        open={openEEDialog}
        handleCancel={() => setOpenEEDialog(false)}
        message={
          <Text
            message='modules.onboarding.containers.information.error'
            values={{ brandName: !isEmpty(onboardingInfo.data) ? onboardingInfo.data.name : '' }}
          />
        }
      />
    </StyledBoardingContainer>
  )
}

InformationQuestionsPage.propTypes = {
  history: PropTypes.object.isRequired
}

export default memo(withRouter(InformationQuestionsPage))
