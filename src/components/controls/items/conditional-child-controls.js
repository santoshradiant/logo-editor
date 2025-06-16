import { useContext } from 'react'
import PropTypes from 'prop-types'
import LogoMakerContext from 'logomaker/context/editor-context'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'

const ConditionalChildControls = ({ children, templateKey, condition }) => {
  const logoMakerContext = useContext(LogoMakerContext)

  if (condition) {
    return children
  }

  const value = get(logoMakerContext.editorTemplate, templateKey)
  return isEmpty(value) ? null : children
}

ConditionalChildControls.propTypes = {
  condition: PropTypes.bool,
  templateKey: PropTypes.string,
  children: PropTypes.node.isRequired
}

export default ConditionalChildControls
