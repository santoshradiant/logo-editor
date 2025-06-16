import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@mui/material/styles'

import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'

import omit from 'lodash/omit'

const useStyles = makeStyles(theme => ({
  root: ({ height }) => ({
    borderRadius: theme.shape.borderRadius + 'px',
    border: 0,
    color: theme.palette.white.main,
    height: height,
    padding: theme.spacing(0, 3),
    maxWidth: '200px'
  }),
  spinner: ({ loaderColor }) => ({
    position: 'absolute',
    right: 30,
    top: 12,
    color: loaderColor || theme.palette.white.main
  })
}))

const SpinnerAdornment = ({ loaderColor, loaderSize }) => {
  const classes = useStyles({ loaderColor })

  return <CircularProgress classes={{ root: classes.spinner }} size={loaderSize} />
}

SpinnerAdornment.propTypes = {
  loaderColor: PropTypes.string,
  loaderSize: PropTypes.number
}

const ButtonWithLoader = props => {
  const { children, showLoader, height, loaderSize, loaderColor } = props
  const classes = useStyles({
    height,
    showLoader
  })
  // <Button does not recognize these props, 'omit' these props to prevent warnings in te console
  const restProps = { ...omit(props, 'loaderSize', 'loaderColor', 'showLoader') }

  return (
    <Button
      classes={{
        root: classes.root,
        label: classes.label
      }}
      {...restProps}
    >
      {children}
      {showLoader && <SpinnerAdornment loaderSize={loaderSize} loaderColor={loaderColor} />}
    </Button>
  )
}

ButtonWithLoader.defaultProps = {
  height: 44,
  loaderSize: 20,
  showLoader: false
}

ButtonWithLoader.propTypes = {
  height: PropTypes.number,
  showLoader: PropTypes.bool,

  children: PropTypes.any,

  loaderSize: PropTypes.number,
  loaderColor: PropTypes.string
}

export default ButtonWithLoader
