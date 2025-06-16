const { stylelintJsx } = require('@eig-builder/core-linting-config')

module.exports = {
  processors: [...stylelintJsx.processors],
  extends: [...stylelintJsx.extends],
  rules: {
    ...stylelintJsx.rules
  }
}
