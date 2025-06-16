const { eslint } = require('@eig-builder/core-linting-config')

module.exports = {
  parser: 'babel-eslint',
  extends: [...eslint.extends],
  plugins: [...eslint.plugins],
  rules: {
    ...eslint.rules,
    'jsx-quotes': ['error', 'prefer-single'],
    quotes: ['error', 'single']
  },
  env: {
    jest: true
  },
  settings: {
    react: {
      version: '^16.8'
    }
  },
  globals: {
    IS_MAIL: true,
    LAYOUT_PATH: true,
    IS_PUBLISHER: true,
    IS_RUNTIME: true,
    IS_EDITOR: true,
    DEBUG_PREVIEW: true,
    DEBUG_LAYOUTS: true,
    DEBUG_BLOG: true,
    DEBUG: true,
    LAYOUT_MAKER: true,
    EDITOR_TEMPLATES_PATH: true,
    USE_DEVKIT: true,
    IS_ADMIN: true
  }
}
