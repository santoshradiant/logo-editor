import React from 'react'
import PropTypes from 'prop-types'
import useLocalize from './use-localize'

const Text = props => {
  const { localize } = useLocalize()
  return <span {...props}>{localize(props.message)}</span>
}

Text.propTypes = {
  message: PropTypes.string
}
export default Text
