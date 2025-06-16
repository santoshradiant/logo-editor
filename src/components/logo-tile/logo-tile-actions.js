import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@mui/material/Grid2'
import Tooltip from '@mui/material/Tooltip'
import Edit from '@mui/icons-material/Edit'
import ZoomIn from '@mui/icons-material/ZoomIn'
// import Share from '@mui/icons-material/Share'
import CloudDownload from '@mui/icons-material/CloudDownload'
import LibraryAdd from '@mui/icons-material/LibraryAdd'
import Delete from '@mui/icons-material/Delete'
import IconButton from '@mui/material/IconButton'
import { useApplicationContext } from 'modules/application-config'

import {
  ActionCard,
  CenterGridItem
  // IconButton
} from './logo-tile.views'

function Action ({ onClick, Icon, tag, disabled = false }) {
  return (
    <CenterGridItem item xs>
      <Tooltip title={tag} disableFocusListener aria-label={tag}>
        <IconButton
          key={`logomaker-my-logos-${tag}-button`}
          onClick={onClick}
          alt={tag}
          disabled={disabled}
        >
          <Icon />
        </IconButton>
      </Tooltip>
    </CenterGridItem>
  )
}
Action.propTypes = {
  onClick: PropTypes.func.isRequired,
  Icon: PropTypes.elementType.isRequired,
  tag: PropTypes.string.isRequired,
  disabled: PropTypes.bool
}

function LogoTileActions ({ onEdit, onPreview, onDownload, onDelete, onDuplicate }) {
  const { shouldDisable } = useApplicationContext()
  return (
    <ActionCard data-test-id='logo-action-card'>
      <Grid container direction='row' sx={{justifyContent:'space-around', alignItems:'center'}}>
        <Action onClick={onEdit} Icon={Edit} tag='edit' />
        <Action onClick={onPreview} Icon={ZoomIn} tag='preview' />
        <Action onClick={onDownload} Icon={CloudDownload} tag='download' />
        {/* <Action onClick={onShare} Icon={EditIcon} tag='edit' /> */}
        <Action onClick={onDuplicate} Icon={LibraryAdd} tag='duplicate' disabled={shouldDisable} />
        <Action onClick={onDelete} Icon={Delete} tag='delete' />
      </Grid>
    </ActionCard>
  )
}
LogoTileActions.propTypes = {
  onEdit: PropTypes.func.isRequired,
  onPreview: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  // onShare: PropTypes.func,
  onDuplicate: PropTypes.func.isRequired
}

export default LogoTileActions
