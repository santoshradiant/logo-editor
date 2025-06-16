import React, { memo } from 'react'
import PropTypes from 'prop-types'

import isEmpty from 'lodash/isEmpty'
import { styled } from '@mui/material/styles'

import { DropdownMenu, DropdownMenuItem, DropdownFooter } from '@eig-builder/compositions-dropdown-menu'

import HelpIcon from '@mui/icons-material/Help'
import ListItemIcon from '@mui/material/ListItemIcon'
import ActionButton from '@eig-builder/compositions-action-button'

import Breakpoints, { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery'

import Text from '@eig-builder/module-localization'
import Typography from '@mui/material/Typography'
import '../lang'
import noop from 'lodash/noop'

import { goToWithHistory } from '@eig-builder/core-utils/helpers/go-to-helper'
import { useNavigate, withRouter } from 'react-router'
import { getHelpUrl } from '@eig-builder/core-utils/helpers/url-helper'
import { DataElementLocations } from '@eig-builder/core-utils/helpers/tagging-helper'

const DropDownWrapper = styled('div')`
  overflow: hidden;
  margin-right: ${({ theme }) => theme.spacing(2)};
  margin-left: ${({ theme }) => theme.spacing(1)};
  @media (max-width: ${Breakpoints.TABLET}px) {
    margin-left: 0;
  }
`

const DropDownMenu = ({ variant, icon, buttons }) => {
  const navigate = useNavigate()
  const goToSupport = () => {
    goToWithHistory(navigate, getHelpUrl(), true)
  }

  // const goToTour = () => {
  //   goToWithHistory(history, baseName + '/tour', true)
  // }

  const isMobile = useIsMobile()

  const items = [
    <DropdownMenuItem key='goto-support' onClick={goToSupport}>
      <ListItemIcon>
        <HelpIcon />
      </ListItemIcon>
      <Typography variant='body2'>
        <Text message='logomakerEditor.dropdown.supportCenter' />
      </Typography>
    </DropdownMenuItem>,

    // REFACTOR
    // add later when getting started is available
    // <DropdownMenuItem onClick={goToTour}>
    //   <ListItemIcon>
    //     <Icon icon='school' />
    //   </ListItemIcon>
    //   <Typography variant='body2'>
    //     <Text message='logomakerEditor.dropdown.gettingStarted' />
    //   </Typography>
    // </DropdownMenuItem>,

    !isEmpty(buttons) ? <DropdownFooter>{buttons}</DropdownFooter> : <div />
  ]

  return (
    <DropDownWrapper>
      <DropdownMenu
        children={items}
        actionElement={
          <ActionButton
            icon={icon}
            border
            onClick={noop}
            dataElementLocation={DataElementLocations.HEADER}
            dataElementLabel='logo-open-menu-control'
            dataElementId='menu'
            height={!isMobile && '39px'}
            width={!isMobile && '39px'}
            padding={0}
          />
        }
      />
    </DropDownWrapper>
  )
}

DropDownMenu.defaultProps = {
  variant: 'default',
  icon: 'more_horiz',
  buttons: []
}

DropDownMenu.propTypes = {
  variant: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  buttons: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired
}

export default memo(DropDownMenu)
