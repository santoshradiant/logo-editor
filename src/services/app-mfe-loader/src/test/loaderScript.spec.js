const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const sinon = require('sinon')
const jsdom = require('jsdom')
const mfeLoader = require('../mfe-loader')

const ScriptAttacher = require('../helpers/add-script')
// Register the chai-as-promised plugin
chai.use(chaiAsPromised)
const expect = chai.expect
// Create a virtual DOM environment with jsdom
const { JSDOM } = jsdom
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
global.window = dom.window
global.document = dom.window.document

describe('mfeLoader', () => {
  let fetchStub
  let addScriptStub

  beforeEach(() => {
    // Create a stub for the fetch function
    fetchStub = sinon.stub()
    global.fetch = fetchStub

    // Create a stub for the addScript function
    addScriptStub = sinon.stub(ScriptAttacher, 'addScript')
  })

  afterEach(() => {
    // Restore the original functions
    addScriptStub.restore()
    global.fetch = undefined
  })

  it('1. should call addScript with the correct URL for a non-URL component name', async () => {
    const componentMapUrl = 'http://example.com/componentMap.json'
    const componentName = 'my-component@1.0.0'
    const componentMap = {
      'my-component@1.0.0': '/path/to/my-component.js',
      'my-component@2.0.0': '/path/to/my-component-2.js',
      'other-component@1.0.0': '/path/to/other-component.js'
    }

    fetchStub.withArgs(componentMapUrl).resolves({
      ok: true,
      json: () => Promise.resolve(componentMap)
    })

    addScriptStub.resolves({})

    const loadScriptsPromise = mfeLoader(componentName, componentMapUrl)

    await expect(loadScriptsPromise).to.be.fulfilled

    expect(addScriptStub.calledOnce).to.be.true

    expect(addScriptStub.getCall(0).args[0]).to.equal('/path/to/my-component.js')
  })

  it('2. should call addScript with the correct URL for a URL component name', async () => {
    const componentName = 'http://example.com/my-component.js'
    const componentMapUrl = 'http://example.com/componentMap.json'
    const componentMap = {
      'my-component@1.0.0': '/path/to/my-component.js',
      'my-component@2.0.0': '/path/to/my-component-2.js',
      'other-component@1.0.0': '/path/to/other-component.js'
    }

    fetchStub.withArgs(componentMapUrl).resolves({
      ok: true,
      json: () => Promise.resolve(componentMap)
    })

    addScriptStub.resolves({})

    const loadScriptsPromise = mfeLoader(componentName, componentMapUrl)

    await expect(loadScriptsPromise).to.be.fulfilled

    expect(addScriptStub.calledOnce).to.be.true

    expect(addScriptStub.getCall(0).args[0]).to.equal('http://example.com/my-component.js')
  })

  it('3. should reject with an error if the component map fetch fails', async () => {
    const componentMapUrl = 'http://example.com/componentMap.json'
    const componentName = 'my-component@1.0.0'

    fetchStub.withArgs(componentMapUrl).resolves({
      ok: false
    })

    const loadScriptsPromise = mfeLoader(componentName, componentMapUrl)

    await expect(loadScriptsPromise).to.be.rejectedWith(
      'Component map not found at http://example.com/componentMap.json'
    )
    expect(addScriptStub.notCalled).to.be.true
  })

  it('4. should reject with an error if findComponentByName returns null', async () => {
    const componentMapUrl = 'http://example.com/componentMap.json'
    const componentName = 'my-component@3.0.0'
    const componentMap = {
      'my-component@1.0.0': '/path/to/my-component.js',
      'my-component@2.0.0': '/path/to/my-component-2.js',
      'other-component@1.0.0': '/path/to/other-component.js'
    }

    fetchStub.withArgs(componentMapUrl).resolves({
      ok: true,
      json: () => Promise.resolve(componentMap)
    })

    sinon.stub(console, 'warn')

    const loadScriptsPromise = mfeLoader(componentName, componentMapUrl)

    await expect(loadScriptsPromise).to.be.rejectedWith(`Component ${componentName} not found in component map`)

    expect(addScriptStub.notCalled).to.be.true

    expect(console.warn.calledOnce).to.be.true

    console.warn.restore()
  })
})
