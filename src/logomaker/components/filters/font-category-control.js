import React, { memo } from 'react'
import PropTypes from 'prop-types'

import { styled } from '@mui/material/styles'
import Grid from '@mui/material/Grid2'
import fontCategories from '../../config/font-categories'
import { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery'

const FontCategoryTab = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  height: 46px;
  padding: ${(props) => props.theme.spacing(1)};
  border: 1px solid ${(props) => (props.selected ? props.theme.palette.primary.main : 'rgba(0, 0, 0, 0.24)')};
  transition: all 0.1s ease-in;

  &:hover {
    cursor: pointer;
    border-color: ${(props) => props.theme.palette.primary.main};
  }

  svg,
  object {
    pointer-events: none;
    user-select: none;
    width: 80%;
    fill: ${(props) => (props.selected ? props.theme.palette.primary.main : 'inherit')};
    overflow: initial;
  }
`

const OverflowFix = styled('div')`
  overflow-x: scroll;
  -webkit-overflow-scrolling: touch; /* Lets it scroll lazy */
  width: 100%;
  margin-bottom: 16px;
`

const MobileContainer = styled('div')`
  width: 648px;
  overflow: hidden;

  > div {
    width: 100px;
    margin-right: 8px;
    float: left;
  }
`

const FontCategoryControl = (props) => {
  const isMobile = useIsMobile()

  const setValue = (category) => {
    props.setValue(category)
  }

  return isMobile ? (
    <OverflowFix>
      <MobileContainer>
        {fontCategories.map((font) => (
          <FontCategoryTab
            key={font.name}
            isMobile={isMobile}
            onClick={() => setValue(font.name)}
            selected={props.value.toLowerCase() === font.name.toLowerCase()}
          >
            <img
              style={{
                maxWidth: '90%',
                height: 'auto'
              }}
              type='image/svg+xml'
              src={font.font}
            />{' '}
          </FontCategoryTab>
        ))}
      </MobileContainer>
    </OverflowFix>
  ) : (
    <Grid container spacing={2} sx={{ pt: 0, pb: 4 }}>
      {fontCategories.map((font) => (
        <Grid key={font.name}  size={{ xs: 6, md: 6, lg: 4 }}>
          <FontCategoryTab
            onClick={() => setValue(font.name)}
            selected={props.value.toLowerCase() === font.name.toLowerCase()}
          >
            <img
              style={{
                maxWidth: '90%',
                height: 'auto'
              }}
              type='image/svg+xml'
              src={font.font}
            />
          </FontCategoryTab>
        </Grid>
      ))}
    </Grid>
  )
}

FontCategoryControl.propTypes = {
  setValue: PropTypes.func.isRequired,
  value: PropTypes.string
}

export default memo(FontCategoryControl)
