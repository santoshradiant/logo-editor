import merge from 'lodash/merge'
import get from 'lodash/get'

class Localizations {
  constructor () {
    this.localizations = {}
  }

  append (keys) {
    this.localizations = merge(this.localizations, keys)
  }

  localize (key) {
    return get(this.localizations, key, key)
  }
}

export default new Localizations()
