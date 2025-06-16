import PropTypes from 'prop-types'
import React, { memo } from 'react'

import IconButton from '@mui/material/IconButton'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'

const PlayButton = ({ onClick }) => {
  return (
    <IconButton>
      <PlayCircleOutlineIcon color='rgba(0,0,0,0.21)' tag='logo-play-button' onClick={onClick} />
    </IconButton>
  )
}

PlayButton.propTypes = {
  onClick: PropTypes.func.isRequired
}

export default memo(PlayButton)
