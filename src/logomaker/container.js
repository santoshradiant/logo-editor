import { connect } from 'react-redux'
import { LogoMaker } from './index'
import MockTemplate from './mock/editorTemplate.json'

const mapStateToProps = state => {
  return {
    editorTemplate: MockTemplate
  }
}

export default connect(mapStateToProps, null)(LogoMaker)
