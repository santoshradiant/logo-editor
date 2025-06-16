import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import CardContent from '@mui/material/CardContent'

import { styled } from '@mui/material/styles'
import Breakpoints, { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery'
import { useEditorContext } from 'logomaker/context/editor-context'

const PreviewCard = styled('div')`
  padding-top: 56%;
  position: relative;
  width: 100%;
  margin-bottom: 20px;
`

const LogoWrapper = styled('div')`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  @media screen and (max-width: ${Breakpoints.TABLET}px) {
    padding: 8px;
  }
`

const SizedCardContent = styled(CardContent)``

const SizedCardContentDiv = styled('div')`
  padding: ${({ theme }) => theme.spacing(3)};
`
const FullWidthPreviewImage = styled('img')`
  width: 100%;
  height: 100%;
  border-radius: 4px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  overflow: hidden;
`

const MerchPreview = ({ preview, options, scrolled }) => {
  const { merchPreviewURL } = useEditorContext()
  const isMobile = useIsMobile()

  const CardContent = isMobile ? SizedCardContentDiv : SizedCardContent
  const classes = classNames('logo-editor-preview', {
    'big-card': preview,
    scrolled: scrolled
  })

  return (
    <div className={classes}>
      {preview ? (
        <React.Fragment>
          <PreviewCard>
            <LogoWrapper preview={preview}>
              <FullWidthPreviewImage src={merchPreviewURL} />
            </LogoWrapper>
          </PreviewCard>
        </React.Fragment>
      ) : (
        <CardContent
          preview={preview}
        >
          <FullWidthPreviewImage src={merchPreviewURL} />
        </CardContent>
      )}
    </div>
  )
}

MerchPreview.propTypes = {
  options: PropTypes.node,
  scrolled: PropTypes.bool,
  preview: PropTypes.bool
}

export default MerchPreview
