import React, { memo } from 'react'
import Button from '@mui/material/Button'
import { FullPageStep } from '@eig-builder/module-brandkit'
import Typography from '@mui/material/Typography'
import Text from '@eig-builder/module-localization'

import Grid from '@mui/material/Grid2'

import AIIcon from '../../assets/icons/ai'
import { getHelperText, useLogoMFEContext } from '../../context/logo-mfe-context'
import Layout from './onboarding.views'

const Create = memo(() => {
  const { state, updateProperties, maxLength } = useLogoMFEContext()
  const [form, setForm] = React.useState(state.template.text)

  const handleGenerate = () => {
    updateProperties({
      ...state,
      activeStep: state.activeStep + 1,
      template: { ...state.template, text: { ...state.template.text, ...form } }
    })
  }

  return (
    <FullPageStep>
      <Layout.TitleContainer container>
        <Grid container spacing={3} wrap='nowrap'>
          <Grid  size='auto'>
            <AIIcon />
          </Grid>
          <Grid  size='auto'>
            <Typography variant='h2' gutterBottom>
              <Text message='logoMFE.onboarding.defineIdentity' />
            </Typography>
          </Grid>
        </Grid>

        <Typography variant='body2'>
          <Text message='logoMFE.onboarding.shareCoupleDetails' />
        </Typography>
      </Layout.TitleContainer>
      <Grid container spacing={2}>
        <Grid  size={12}>
          <Layout.Field
            variant='outlined'
            id='onboarding-brand'
            fullWidth
            name='brandName'
            onChange={e => setForm({ ...form, brandName: e.target.value })}
            value={form.brandName}
            placeholder='Brand, company name'
            inputProps={{
              maxLength
            }}
            helperText={getHelperText(form.brandName)}
          />
        </Grid>
        <Grid  size={12}>
          <Layout.Field
            fullWidth
            multiline
            id='onboarding-multiline'
            variant='outlined'
            rows={2}
            maxRows={4}
            name='description'
            onChange={e => setForm({ ...form, description: e.target.value })}
            value={form.description}
            placeholder='Tell me about your brand...'
            inputProps={{
              maxLength: 500
            }}
            helperText={getHelperText(form.description, 500)}
          />
        </Grid>
        <Grid  size={12}>
          <Button disabled={!form?.brandName} fullWidth variant='contained' size='large' onClick={handleGenerate}>
            <Text message='logoMFE.onboarding.generateLogo' />
          </Button>
        </Grid>
      </Grid>
    </FullPageStep>
  )
})

export default Create
