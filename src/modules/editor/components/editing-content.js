import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { styled } from '@mui/material/styles'

import Breakpoints from '@eig-builder/core-utils/hooks/useResponsiveQuery'

export const FlexFlowCard = styled('div')`
  display: flex;
  align-items: flex-start;
  flex-direction: row;
  justify-content: space-between;
`

// const mobileEditingHeight = Math.round((window.innerHeight / 3) - 64) + 100
// height: ${mobileEditingHeight}px;

export const EditingContent = styled('div')`
  width: 40%;
  margin: auto;
  width: 100%;
  transition: all 1s;

  @media screen and (max-width: ${Breakpoints.MOBILE}px) {
    margin-top: 56px;
  }

  @media screen and (max-width: ${Breakpoints.TABLET}px) {
    margin-top: 56px;
    width: 70%;
  }
  @media only screen and (orientation: landscape) and (max-height: 450px) and (max-width: 900px) {
    width: 53%;
    margin: 0 auto;

    .logo-editor-preview {
      padding-top: 14px;
    }
  }
  @media screen and (min-height: 760px) {
    &.closeupMode {
      /* margin-top: 20vh; */
      /* margin-bottom: 50vh; */
      width: 100%;
    }
  }
`

const EditingComponent = ({ children, onScroll }) => {
  // const [state, setState] = useState(false)
  // const isMobile = useIsMobile()
  return (
    <EditingContent onScroll={onScroll}>
      <FlexFlowCard children={children} />
      {/* {isMobile && <StyledPaper>
      <ActionButton
        height='24px'
        width='24px'
        onClick={() => { setState(!state) }}
        icon={state ? 'expand_less' : 'expand_more'}
        active={false}
      />
    </StyledPaper>
    } */}
    </EditingContent>
  )
}

EditingComponent.propTypes = {
  children: PropTypes.node.isRequired,
  onScroll: PropTypes.func.isRequired
}

export default memo(EditingComponent)
