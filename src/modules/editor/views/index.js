import React from 'react'
import PropTypes from 'prop-types'
import { styled } from '@mui/material/styles'

export const DownloadPageContainer = styled('div')`
  padding-top: 4em;
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(4)};
`

const FolderContainerUpperLid = styled('div')`
  z-index: -1;
  position: absolute;
  top: ${({ theme }) => theme.spacing(-3)};
  right: 0;
  height: ${({ theme }) => theme.spacing(3)};
  width: ${({ theme }) => theme.spacing(16)};
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-bottom: none;
  border-top-left-radius: ${({ theme }) => theme.spacing(2)};
  border-top-right-radius: ${({ theme }) => theme.spacing(2)};
  background-color: #f6f6f6;
  box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.2), 0px 3px 4px rgba(0, 0, 0, 0.12), 0px 2px 4px rgba(0, 0, 0, 0.14);
`

const FolderContainerBackground = styled('div')`
  position: relative;
  display: inline-block;
  padding: ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.spacing(2)};
  border-top-right-radius: 0;
  background-color: ${({ theme }) => theme.palette.white.main};
  box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.2), 0px 3px 4px rgba(0, 0, 0, 0.12), 0px 2px 4px rgba(0, 0, 0, 0.14);
`

export const FolderContainer = ({ children, ...props }) => (
  <FolderContainerBackground {...props}>
    <FolderContainerUpperLid />
    {children}
  </FolderContainerBackground>
)

FolderContainer.propTypes = {
  children: PropTypes.node
}
