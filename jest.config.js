const { jest } = require('@eig-builder/core-unit-test')

module.exports = {
  ...jest.jestConfig,
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  coverageThreshold: {
    './src/components/**/*.js': {
      statements: 100,
      branches: 80,
      functions: 100,
      lines: 100
    }
  }
}
