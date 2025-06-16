const { expect } = require('chai')

const { findComponentByName } = require('../helpers/find-component-by-name')

// create mock data fpr componentMap
const componentMap = {
  'nd@1.0.1': 'Component A',
  'nd@1.1.0': 'Component B',
  'nd@1.1.1': 'Component C',
  'nd@1.2.1': 'Component C 1.2.1',
  'nd@2.0.0': 'Component D',
  'nd@2.1.0': 'Component E',
  'nd@2.1.1': 'Component F'
}

describe('findComponentByName', () => {
  it('returns the correct component when given a valid name and version', () => {
    const componentName = 'nd@2.1.0'
    const expectedComponent = 'Component E'
    const actualComponent = findComponentByName(componentName, componentMap)
    expect(actualComponent).to.equal(expectedComponent)
  })
  it('returns null when given an invalid name or version', () => {
    const componentName = 'unknown@1.0.0'
    const actualComponent = findComponentByName(componentName, componentMap)
    expect(actualComponent).to.equal(actualComponent, null)
  })

  it('returns the latest version of a component when no version is specified', () => {
    const componentName = 'nd'
    const expectedComponent = 'Component F'
    const actualComponent = findComponentByName(componentName, componentMap)
    expect(actualComponent).to.equal(expectedComponent)
  })

  it('handles components with only major version numbers', () => {
    const componentName = 'nd@1'
    const expectedComponent = 'Component C 1.2.1'
    const actualComponent = findComponentByName(componentName, componentMap)
    expect(actualComponent).to.equal(expectedComponent)
  })
})
