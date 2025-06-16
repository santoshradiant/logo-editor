import React from 'react'
import PropTypes from 'prop-types'
import Text from '@eig-builder/module-localization'

import Layout from './menu.views'
import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'
import FormGroup from '@mui/material/FormGroup'
import FormControl from '@mui/material/FormControl'
import Fade from '@mui/material/Fade'
import SloganField from './slogan-field'
import { getHelperText } from 'modules/logo-mfe/context/logo-mfe-context'

const Menu = ({ setLogoState, logoState, maxLength }) => {
  const [enableSloganField, setEnableSloganField] = React.useState(logoState.text.slogan?.length > 0)
  const [disabledBrandInfo, setDisabledBrandInfo] = React.useState(true)
  const [prevSlogan, setPrevSlogan] = React.useState('')
  const [height, setHeight] = React.useState('0px')

  const handleSloganSwitch = () => {
    if (logoState.text.slogan) {
      setPrevSlogan(logoState.text.slogan)
    }
    setHeight('auto')
    handleChange({ text: { ...logoState.text, slogan: !enableSloganField ? prevSlogan : '' } })
    setEnableSloganField(!enableSloganField)
  }

  const handleChange = values => {
    setLogoState({ ...logoState, ...values })
  }

  return (
    <Layout>
      <Layout.BrandDetailsContainer container>
        <Layout.Grid item>
          <Typography variant='h5'>
            <Text message='logoMFE.brandDetails' />
          </Typography>
        </Layout.Grid>
        <Layout.Grid item>
          <FormControl component='fieldset'>
            <FormGroup aria-label='position' row>
              <Layout.StyledFormControlLabel
                label='Brand Name'
                labelPlacement='top'
                name='brandName'
                control={
                  <Layout.Field
                    variant='outlined'
                    fullWidth
                    inputProps={{
                      maxLength: maxLength
                    }}
                    name='brandName'
                    onChange={e => handleChange({ text: { ...logoState.text, brandName: e.target.value } })}
                    value={logoState.text.brandName}
                    helperText={getHelperText(logoState.text.brandName)}
                  />
                }
              />
              <Layout.StyledFormControlLabel
                label='Brand info'
                labelPlacement='top'
                name='description'
                control={
                  <Layout.Field
                    variant='outlined'
                    fullWidth
                    inputProps={{
                      maxLength: 500
                    }}
                    InputProps={{
                      endAdornment: (
                        <Layout.Button
                          textColor={disabledBrandInfo}
                          type='link'
                          onClick={() => {
                            setDisabledBrandInfo(!disabledBrandInfo)
                          }}
                        >
                          <Text message='logoMFE.logoSelection.menu.change' />
                        </Layout.Button>
                      )
                    }}
                    disabled={disabledBrandInfo}
                    name='description'
                    onChange={e => handleChange({ text: { ...logoState.text, description: e.target.value } })}
                    value={logoState.text.description}
                    helperText={getHelperText(logoState.text.description, 500)}
                  />
                }
              />
              <Layout.ToggleContainer>
                <Layout.SwitchContainer>
                  <Typography variant='h5'>
                    <Text message='logoMFE.logoSelection.menu.showIcon' />
                  </Typography>
                  <Switch
                    color='primary'
                    checked={logoState.text.showHideSymbol}
                    onChange={e => handleChange({ text: { ...logoState.text, showHideSymbol: e.target.checked } })}
                />
                </Layout.SwitchContainer>
                <Layout.SwitchContainer>
                  <Typography variant='h5'>
                    <Text message='logoMFE.logoSelection.menu.showSlogan' />
                  </Typography>
                  <Switch checked={enableSloganField} onChange={handleSloganSwitch} color='primary' />
                </Layout.SwitchContainer>
              </Layout.ToggleContainer>
              <Fade
                onExited={() => setHeight('0px')}
                onEnter={() => setHeight('auto')}
                in={enableSloganField}
                timeout={500}
              >
                <Layout.StyledFormControlLabel
                  height={height}
                  alignContent='start'
                  control={<SloganField handleChange={handleChange} logoState={logoState} />}
                  label='Slogan'
                  labelPlacement='top'
                />
              </Fade>
            </FormGroup>
          </FormControl>
        </Layout.Grid>
        <Layout.Grid item />
      </Layout.BrandDetailsContainer>
    </Layout>
  )
}
Menu.propTypes = {
  logoState: PropTypes.object,
  maxLength: PropTypes.number,
  setLogoState: PropTypes.func
}
export default Menu
