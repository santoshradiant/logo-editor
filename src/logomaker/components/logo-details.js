import React, { memo } from 'react'
import Tooltip from '@mui/material/Tooltip'
import { useEditorContext } from '../context/editor-context'
import PropTypes from 'prop-types'
import IconButton from '@mui/material/IconButton'

import { styled } from '@mui/material/styles'

import InfoIcon from '@mui/icons-material/Info'

const DetailBox = styled('div')`
  width: 280px;
  ul {
    list-style: none;
  }
`
const StyledTooltip = styled(Tooltip)`
  background-color: white;
  color: black;
  font-size: 20px;
`
const LogoDetails = (props) => {
  const { editorTemplate } = useEditorContext()

  const { font, text } = editorTemplate
  return (
    <StyledTooltip
      placement='left'
      title={
        <DetailBox>
          <ul>
            <li>Name: {text.brandName}</li>
            <li>Slogan: {text.slogan}</li>
            <li>Symbol: {text.slogan}</li>
            <li>
              Fonts: {font.brand1.id} & {font.brand2.id}
            </li>
          </ul>
        </DetailBox>
      }
    >
      <IconButton>
        <InfoIcon color='rgba(0,0,0,0.21)' tag='logo-detail-button' />
      </IconButton>
    </StyledTooltip>
  )
}

LogoDetails.propTypes = {
  classes: PropTypes.object.isRequired
}

export default memo(LogoDetails)
