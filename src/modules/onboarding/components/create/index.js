import React, { useEffect, useRef, useState, useContext } from 'react'
import { SingleSpaContext } from 'single-spa-react'
import { useLocation } from 'react-router'
import { styled } from '@mui/material/styles'
import isEmpty from 'lodash/isEmpty'
import debounce from 'lodash/debounce'
import { AppSetupContext } from '@eig-builder/module-app-setup'
import useGetOnboardingInfo from 'modules/onboarding/hooks/use-get-onboarding-info'

import Text from '@eig-builder/module-localization'
import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import TextFieldWithUndo from '../../../components/common/text-field-with-undo'
import { mfeRefreshToken, useMaterialTheme, MfeContext } from '@eig-builder/module-addons-mfe'
import { DataElementLocations } from '@eig-builder/core-utils/helpers/tagging-helper'
import { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery'
import Typography from '@mui/material/Typography'

import ErrorDialog from 'logomaker/components/error-dialog'
import { useOnboardingContext } from '../../context/onboarding-context'
import '../../containers/lang'

const SloganContainerDiv = styled('div')`
  position: relative;
  width: 100%;
`
const SloganText = styled('div')`
  position: relative;
  display: inline-block;
  width: 100%;
  & > div > div {
    padding-right: ${({ theme }) => theme.spacing(1)};
  }
`
const AiSlogan = styled('div')`
  overflow: visible;
  position: relative;
  [data-ai-id='ai-mfe-content'] {
    position: absolute;
    top: 50%;
    transform: translate(-90%, -40%);
  }
  [data-ai-id='ai-mfe-launch-button'] {
    opacity: ${({ focus }) => (focus ? '1' : '0')};
  }
`

const useQueryParams = () => {
  return new URLSearchParams(useLocation().search)
}

const Create = () => {
  const sloganFieldRef = useRef()
  const query = useQueryParams()
  const [openEEDialog, setOpenEEDialog] = useState(false)
  const { properties } = React.useContext(SingleSpaContext)
  const [focus, setFocus] = useState(false)
  const debounceRef = useRef(false)
  const { StandAloneMfe: StandAloneAI, loaded } = useContext(MfeContext)
  const theme = useMaterialTheme()
  const sloganFirstRender = useRef(true)
  const { isOPN } = useContext(AppSetupContext)
  const isMobile = useIsMobile()

  const { stepValues, instance, saveStepValues, setOnboardingInfo, setContinueButton, resetLogoAmount } =
    useOnboardingContext()

  const [slogan, setSlogan] = useState(stepValues.Create.slogan || '')
  const [companyName, setCompanyName] = useState(stepValues.Create.brandName || '')
  const onboardingId = properties?.onboardingId || query.get('editor')
  const { data, isSuccess } = useGetOnboardingInfo(onboardingId)

  useEffect(() => {
    if (document.referrer.includes('designer') || document.referrer.includes('express-editor')) {
      window.localStorage.setItem('CREATE_OPENED_FROM_EE', 'true')
    }
  }, [])

  useEffect(() => {
    if (data) {
      setOnboardingInfo(data)
      if (data.name && data.name.length > 2) {
        setCompanyName(data.name)
      } else {
        setOpenEEDialog(true)
      }

      if (data.slogan) {
        setSlogan(data.slogan)
      }
    }
  }, [isSuccess])

  const getHelperText = (value) => {
    const max = 40

    if (value && value.length) {
      return `${value.length}/${max}`
    }
  }

  const generateNewLogos = React.useMemo(
    () =>
      debounce((name, value) => {
        if (debounceRef.current) {
          debounceRef.current = false
          return
        }
        resetLogoAmount()
        saveStepValues({ [name]: value }, 'Create')
      }, 500),
    [resetLogoAmount, saveStepValues, debounceRef.current]
  )

  const setBrandName = (e) => {
    const { name, value } = e.target
    setCompanyName(value)
    if (value.length === 0) {
      resetLogoAmount()
      saveStepValues({ [name]: '', slogan: '' }, 'Create')
      setSlogan('')
      debounceRef.current = true
    } else if (value.length <= 40) {
      debounceRef.current = false
      generateNewLogos(name, value)
    }
  }

  useEffect(() => {
    if (companyName || slogan) {
      if (isMobile) {
        setContinueButton(true)
      }
      instance.update({
        text: {
          brandName: companyName,
          slogan: slogan
        }
      })
    } else {
      if (isMobile) {
        setContinueButton(false)
      }
    }
  }, [companyName, instance, isMobile, setContinueButton, slogan])

  const onChangeSlogan = (value) => {
    const removedQuotes = value?.replace(/^"(.*)"$/, '$1')
    setSlogan(removedQuotes)
    if (removedQuotes.length <= 40) {
      generateNewLogos('slogan', removedQuotes)
    }
  }

  const initMfe = (selector, callback, buttonText) => {
    StandAloneAI.init({
      token: '',
      data: {
        shouldCloseOnGenerate: true,
        promptId: '73896578-1917-4188-a959-84182da11f29',
        closeOnClickAway: true,
        popperProps: {
          placement: 'top',
          disablePortal: true,
          modifiers: [
            {
              name: 'flip',
              enabled: true,
              options: {
                altBoundary: true,
                rootBoundary: 'viewport',
                padding: 8
              }
            },
            {
              name: 'preventOverflow',
              enabled: true,
              options: {
                altAxis: true,
                altBoundary: true,
                tether: false,
                rootBoundary: 'viewport',
                padding: 8
              }
            }
          ]
        },
        buttonProps: {
          variant: 'text',
          text: buttonText,
          isicononly: true
        }
      },
      theme: theme?.v5,
      callbacks: {
        refreshAccessToken: async () => {
          return mfeRefreshToken()
        },
        onGenerateContent: (val) => {
          callback(val)
        }
      },
      selector: selector
    })
  }

  useEffect(() => {
    const unload = () => {
      let element = document.querySelector('#slogan-ai-mfe')
      if (element === null) {
        element = document.createElement('div')
        element.id = 'slogan-ai-mfe'
        document.body.appendChild(element)
      }
      if (StandAloneAI) {
        StandAloneAI.closeAi('slogan-ai-mfe')
      }
      const aiPopper = document.querySelector('[data-ai-id="ai-mfe-popper"]')
      if (aiPopper) {
        aiPopper.remove()
      }
    }
    window.onbeforeunload = unload
    return unload
  }, [StandAloneAI])

  const showSloganField = isMobile || companyName.length > 0

  return (
    <Grid container spacing={0} className='px-4 mt-5 mt-sm-0'>
      <Grid size={12}>
        <div className={`wrapper-inputfields ${showSloganField ? 'slogan--show' : ''}`}>
          <TextFieldWithUndo
            className='mt-2 mb-2'
            fullWidth
            autoFocus={!isMobile}
            variant='outlined'
            name='brandName'
            onChange={setBrandName}
            label={<Text message='modules.onboarding.steps.create.brandName' />}
            value={companyName}
            helperText={getHelperText(companyName)}
            lotProps={{ htmlInput: { 'data-test-id': 'brand-name-button' } }}
            dataElementLocation={DataElementLocations.LEFT_RAIL}
            dataElementLabel='logo-brandname'
            dataElementId='logomaker-onboarding-brandname-field'
          />

          {showSloganField && (
            <>
              <SloganContainerDiv>
                <SloganText>
                  <TextFieldWithUndo
                    variant='outlined'
                    fullWidth
                    name='slogan'
                    onFocus={() => {
                      if (isOPN && loaded && sloganFirstRender.current) {
                        sloganFirstRender.current = false
                        initMfe('slogan-ai-mfe', onChangeSlogan, 'test')
                      }
                      setFocus(true)
                    }}
                    onBlur={() => {
                      sloganFirstRender.current = true
                      setFocus(false)
                    }}
                    onChange={(e) => {
                      onChangeSlogan(e.target.value)
                    }}
                    value={slogan}
                    label={<Text message='modules.onboarding.steps.create.slogan' />}
                    inputRef={sloganFieldRef}
                    slotProps={{
                      htmlInput: { 'data-test-id': 'slogan-button' }
                    }}
                    InputProps={{
                      endAdornment: <AiSlogan id='slogan-ai-mfe' focus={focus} isMobile={isMobile} />
                    }}
                    helperText={getHelperText(slogan)}
                    dataElementLocation={DataElementLocations.LEFT_RAIL}
                    dataElementLabel='logo-slogan'
                    dataElementId='logomaker-onboarding-slogan-field'
                  />
                </SloganText>
              </SloganContainerDiv>
              {!isMobile && (
                <Typography variant='body1'>
                  <Text message='modules.onboarding.steps.create.description' />
                </Typography>
              )}
            </>
          )}
        </div>
      </Grid>

      <ErrorDialog
        open={openEEDialog}
        handleCancel={() => setOpenEEDialog(false)}
        message={
          <Text
            message='modules.onboarding.containers.information.error'
            values={{ brandName: !isEmpty(data) ? data.name : '' }}
          />
        }
      />
    </Grid>
  )
}

export default Create
