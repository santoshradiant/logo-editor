const { stylelint } = require('@eig-builder/core-linting-config')

module.exports = {
  processors: [...stylelint.processors],
  extends: [...stylelint.extends],
  rules: {
    ...stylelint.rules,
    'color-hex-case': 'upper'
  }
}
