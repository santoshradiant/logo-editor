import React from 'react'
import PropTypes from 'prop-types'
import { styled } from '@mui/material/styles'

import { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery'

import Layout from './menu.views'
import { getHelperText, useLogoMFEContext } from 'modules/logo-mfe/context/logo-mfe-context'

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
const SloganField = ({ logoState, handleChange }) => {
  const { initAI, isLoadedAI, maxLength } = useLogoMFEContext()
  const [focus, setFocus] = React.useState(false)
  const sloganFirstRender = React.useRef(true)
  const isMobile = useIsMobile()

  const onChangeSlogan = value => {
    const removedQuotes = value?.replace(/^"(.*)"$/, '$1')
    handleChange({ text: { ...logoState?.text, slogan: removedQuotes } })
  }

  return (
    <SloganContainerDiv>
      <SloganText>
        <Layout.Field
          variant='outlined'
          fullWidth
          max={maxLength}
          onFocus={() => {
            if (isLoadedAI && sloganFirstRender.current) {
              sloganFirstRender.current = false
              initAI('slogan-ai-mfe', onChangeSlogan, 'test')
            }
            setFocus(true)
          }}
          InputProps={{
            endAdornment: <AiSlogan id='slogan-ai-mfe' focus={focus} isMobile={isMobile} />
          }}
          inputProps={{
            'data-test-id': 'slogan-button',
            maxLength: maxLength
          }}
          onChange={e => handleChange({ text: { ...logoState?.text, slogan: e.target.value } })}
          value={logoState?.text.slogan}
          helperText={getHelperText(logoState?.text.slogan)}
        />
      </SloganText>
    </SloganContainerDiv>
  )
}
SloganField.propTypes = {
  logoState: PropTypes.object,
  handleChange: PropTypes.func
}
export default SloganField
