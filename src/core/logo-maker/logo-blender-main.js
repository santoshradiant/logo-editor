/*****************************************************/
/* ******** OLD TEST INTERFACE FOR LOGOBUILDER ***** */
/*****************************************************/
import React, { Component } from 'react'
import TextField from '@mui/material/TextField'
import Select from '@eig-builder/control-select'

// import MenuItem from '@mui/material/Menu-Item'
// import Button from '@eig-builder/core-components/button'
import FontResources from './resources/font-resources'
import SymbolResources from './resources/symbol-resources'
import LogoMaker from './logo-maker'
import LogoInstance from './logo-instance'
import './style/logo-blender-main.scss'
import Slider from '@mui/material/Slider'
import Button from '@mui/material/Button'

// import ReactJson from 'react-json-view'
import DecorationLayout from './layouts/decoration-layout'
import SymbolLayout from './layouts/symbol-layout'
import SloganLayout from './layouts/slogan-layout'
import BrandLayout from './layouts/brand-layout'
// import withPasswordProtect from '../basic-auth/hoc/withPasswordProtect'
import { connect } from 'react-redux'
// import goTo from '@eig-builder/core-utils/helpers/go-to-helper'

import PropTypes from 'prop-types'

// Actions
import { setTemplateActive } from '../editor/store/actions'
import WordResources from './resources/word-resources'
import amcore from './amcore'
import GLTFModelLoader from './resources/gltf-model-loader'

const logoCount = 1
const symbolCount = 50
let stateCount = 0

class LogoBlenderMain extends Component {
  static propTypes = {
    setTemplate: PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.object
  }

  constructor () {
    super()

    this.state = {
      whichGrid: 'logo',
      stateCount: 0,
      text: {
        brandName: 'Great Cookies',
        slogan: '' // 'They just melt in your mouth'
      },
      font: {
        brand1: {
          size: 1.0,
          lineSpacing: 1.0,
          letterSpacing: 1.0,
          id: undefined
        },
        brand2: {
          size: 1.0,
          lineSpacing: 1.0,
          letterSpacing: 1.0,
          id: undefined
        },
        slogan: {
          size: 1.0,
          lineSpacing: 1.0,
          letterSpacing: 1.0,
          id: undefined
        }
      },
      layout: {
        decoration: {
          // style: 'none'
        },
        brand: {
          // alignment: 'horizontal',
          // fontStyle: 'single'
        },
        slogan: {},
        symbol: {
          // position: 'none',
          // decoration: 'none'
        }
      },
      symbol: {}
    }

    this.logoMaker = new LogoMaker()
    this.logoDivs = []
    this.symbolDivs = []

    // Create placeholder for the div refs for the logoMaker
    for (let i = 0; i < logoCount; i++) {
      this.logoDivs.push(React.createRef())
    }

    for (let i = 0; i < symbolCount; i++) {
      this.symbolDivs.push(React.createRef())
    }
  }

  componentDidMount = () => {
    this.regenerateLogos()
  }

  regenerateLogos = () => {
    this.setState({ whichGrid: 'logo' })
    setTimeout(() => {
      try {
        this.logoMaker.generatePlain(
          this.logoDivs.map(e => e.current),
          { ...this.state },
          true
        )
      } catch (ex) {
        console.error('error generating logos: ', ex)
      }
    }, 0)
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }

    this.logoMaker.updateTemplateData({ ...this.state })
    this.timeout = null
  }

  componentWillUnmount = () => {
    this.logoMaker.destroy()
    this.logoMaker = null
  }

  setBrandName (value) {
    this.state.text.brandName = value || undefined
    this.setState(this.state)
  }

  setSlogan (value) {
    this.state.text.slogan = value || ''
    this.setState(this.state)
  }

  setInitials (value) {
    this.state.text.initials = value || undefined
    this.setState(this.state)
  }

  setLineSpacing = (name, value) => {
    this.state.font[name].lineSpacing = value || undefined
    this.setState(this.state)
  }

  setLetterSpacing = (name, value) => {
    this.state.font[name].letterSpacing = value || undefined
    this.setState(this.state)
  }

  setFont = (name, key, value) => {
    this.state.font[name][key] = value || undefined
    this.setState(this.state)
  }

  setFontSize = (name, value) => {
    this.state.font[name].size = value || undefined
    this.setState(this.state)
  }

  setFontFamily = (name, value) => {
    this.state.font[name].id = value || undefined
    this.setState(this.state)
  }

  setLayout = (partKey, varKey, value) => {
    this.state.layout[partKey][varKey] = value || undefined
    this.setState(this.state)
  }

  handleAnimate = (event, ix) => {
    event.stopPropagation()

    const logo = this.logoMaker.allLogos[ix]
    logo.animateLogo(ix)

    window.cloneLogo = new LogoInstance(logo.templateData)
  }

  selectTemplate = domRef => {
    const templateDetails = domRef && domRef.currentTarget && domRef.currentTarget.dataLogoInstance.templateData
    if (templateDetails) {
      this.props.setTemplate(templateDetails)
      // goTo(this.context, '/editor')
    }
  }

  showFonts = () => {
    this.setState({ whichGrid: 'font' })
  }

  doTest = () => {
    amcore.loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/101/three.min.js')
    amcore.loadScript('https://threejs.org/examples/js/loaders/GLTFLoader.js')
    window.Loader = new GLTFModelLoader(
      'https://sketchfab-prod-media.s3.amazonaws.com/archives/0033908c6c3a4e8c8e5e12a75becb707/gltf/c33c244696cc4b3f816cc2ceed77e4b8/billy_the_bumble_bee.zip?Expires=1551103529&Signature=02Ik%2FmWjnRQm91J0PV%2F8ZChyB0I%3D&AWSAccessKeyId=ASIAZ4EAQ242FLDI3LR2&x-amz-security-token=FQoGZXIvYXdzEJ%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaDHZpsleq5%2B8BQxLo%2FyK3A5PfrR%2FovJftnca%2BSylvWG3ekoGm7hKgIYkPKptMufsx61VF52GRPGPypQ1EsGnZ%2FZmKHZMCTek9H6xDG%2BvWmTblzMi8PHvs25vPdTVu%2BXWySPi4WMVYHnr6uiefApeJn9F31cldXnl3POINzi0CFM1dTj8RibNs57p9N79Mf39ZHbPsZ6Y67o1MlXAq2XSzgzMHNr%2BfNM8atkupJv3LLaolL2f8HgFgiXCkvH2d3HGvqVPPS3ikR3RHWj08wJRUFICRyP3da7ZjT4IEFMHaR9CW174MA%2BfpjzJOMWjseDCmzxSMvhL0r6fQyKvGkjXMuL2qjTsOeVtl8%2BJ7E1iasMMQ3XH%2F8Yu0z5wsqHUlWMUK9RkTRJqu9%2FC439dMOVomzIK%2F%2FYa9ClFcSPHnJZr2vhjopWd7S1noakEmXpgrC2kirAriAOEhIjjK7Icfn08Btj7Pfu1r2Uupgxj%2FIhOu6Tyg4VPL3em1hod6C%2FaZK73lKLrMhdDVWRY86GYOHgON8bfgRm7Dqg0qkhBTN4mUHu54cSVfUCs%2FpsJ2u9L%2Fp1wXVI43KHP7Pp112bcJMT6BKl1PpMAINoYonOfP4wU%3D',
      { rewriteAssetURLs: true }
    )
  }

  refresh = () => {
    this.setState({ stateCount: stateCount++ })
  }

  showSymbols = () => {
    // Load all symbols
    const sr = SymbolResources.getInstance()
    for (const ssi of Object.values(sr.searchCache)) {
      ssi.get().then(result => {
        if (result && result.result) {
          for (const logo of result.result) {
            sr.getSymbolInstance(
              {
                type: 'external',
                id: logo.id,
                url: logo.svg_url // TODO: Remove || val.name if id is implemented
              },
              () => this.refresh()
            )
          }
        }
      })
    }

    // Load all fonts in symbols
    FontResources.getInstance().mapFonts(font => {
      font.analyzeSymbol = sr.getSymbolInstance({
        type: 'initials',
        id: 'dp',
        fontId: font.id,
        initials: 'dp' // abcdefghijklmnopqrstuvwxyz
      })
    })
    this.setState({ whichGrid: 'symbol' })
    // setTimeout(() => {
    //   let sr = SymbolResources.getInstance()

    //   let i = 0
    //   for (let si of Object.values(sr.instanceCache)) {
    //     let ref = this.symbolDivs[i]
    //     if (si.analyzeData) {
    //       ref.appand
    //     }
    //   }
    // }, 0)
  }

  symbolClick = si => {
    // console.log(si.analyzeData)
    this.state.symbol.icon = si.symbolData
    this.state.whichGrid = 'logo'
    this.setState(this.state)
  }

  fontClick = fi => {}

  createFontGrid = () => {
    const result = []
    FontResources.getInstance().mapCache(fi => {
      result.push(
        <div className='font-preview' key={`font-${fi.id}`} onClick={() => this.fontClick(fi)}>
          {fi.id} {JSON.stringify(fi.fontInfo)}
        </div>
      )
    })
    return result
  }

  createSymbolGrid = () => {
    const result = []

    const sr = SymbolResources.getInstance()

    const showNum = x => {
      if (x && isFinite(x)) {
        return x.toFixed(2)
      } else {
        return x
      }
    }
    const list = Object.values(sr.instanceCache)
    list.sort((a, b) => {
      try {
        let x = a.analyzeData.averageThickness
        let y = b.analyzeData.averageThickness
        if (!isFinite(x)) x = 0
        if (!isFinite(y)) y = 0
        return x - y
      } catch (ex) {
        return -1
      }
    })

    for (const si of list) {
      if (si.analyzeData) {
        const fillSymbolSvg = el => {
          if (el) {
            el.dataSymbolInstance = si
            let r = si.getSymbolOk() ? 212 : 255
            let g = si.getSymbolIsCircle() ? 255 : 212
            let b = si.getSymbolIsInverted() ? 255 : 212
            if (si.getSymbolIsO()) {
              r = 0
              g = 255
              b = 0
            }
            el.style.background = 'rgb(' + r + ',' + g + ',' + b + ')'

            el.innerHTML = si.svgStr
            if (el.firstChild && el.firstChild.style) {
              el.firstChild.style.width = '100%'
              el.firstChild.style.height = '100%'
            } else {
              el.innerText = '??'
            }
          }
        }
        result.push(
          <div className='symbol-preview' key={`symbol-${si.cacheKey}`} onClick={() => this.symbolClick(si)}>
            <div className='symbol-svg' ref={fillSymbolSvg} />
            <div className='symbol-info'>
              <label>{si.cacheKey}</label>
              <br />
              <label>Filled</label>
              <data>{showNum(si.analyzeData.fillPercentage * 100)}%</data>
              <br />
              <label>Thickness</label>
              <data>{showNum(si.analyzeData.averageThickness)}</data>
              <label>Max swaps</label>
              <data>{showNum(si.analyzeData.swapMax)}</data>
            </div>
          </div>
        )
      }
    }
    // for (let i = 0; i < symbolCount; i++) {
    //   result.push(<div className='symbol-preview' key={`symbol-${i}`} ref={this.symbolDivs[i]} />)
    // }
    return result
  }

  addFontSlider = (name, key, min = 0.5, max = 2.0) => {
    return (
      <div>
        <div className='sliderLabel'>{key}</div>
        <Slider
          className='slider'
          key={name + '_' + key}
          min={min}
          max={max}
          step={0.01}
          value={this.state.font[name][key]}
          onChange={(e, value) => this.setFont(name, key, value)}
        />
      </div>
    )
  }
  /* <Select
        className='select'
        name={'Select a ' + name + ' font '}
        onChange={(e, i, value) => this.setFontFamily(name, value)}
        value={this.state.font[name].id} >
        {
          FontResources.getInstance().mapFonts((font) => {
             return <MenuItem key={font.id} value={font.id} primaryText={font.name} />
          })
        }
        <MenuItem key='default' value='' primaryText='<random>' />
      </Select> */

  createFontSettings = name => {
    return (
      <div className='font-settings-test'>
        <Select
          name={'font_select_' + name}
          label={'Select a ' + name + ' font '}
          value={this.state.font[name].id}
          onChange={value => this.setFontFamily(name, value)}
          options={FontResources.getInstance().mapFonts(font => ({
            label: font.name,
            value: font.id
          }))}
        />

        {this.addFontSlider(name, 'size')}
        {this.addFontSlider(name, 'lineSpacing')}
        {this.addFontSlider(name, 'letterSpacing')}
        {this.addFontSlider(name, 'outline', -0.01, 12.0)}
        {this.addFontSlider(name, 'decoration', -0.01, 5.0)}
      </div>
    )
  }

  addLayoutPropDropDown = (layoutOption, varKey) => {
    const variations = layoutOption.prototype.variations
    let partName = layoutOption.name.toLowerCase()
    if (partName.endsWith('layout')) {
      partName = partName.substring(0, partName.length - 6)
    }
    const getItems = o => {
      const results = []
      for (const x in o) {
        results.push({
          label: x,
          value: x
        }) // <MenuItem key={x} value={x} primaryText={x} />)
      }
      return results
    }
    return (
      <Select
        name={'layout_select_' + layoutOption}
        label={partName + '.' + varKey}
        key={partName + '.' + varKey}
        value={this.state.layout[partName][varKey]}
        onChange={value => this.setLayout(partName, varKey, value)}
        options={getItems(variations[varKey])}
      />
    )
    // <Select
    //   className='select'
    //   key={partName + '.' + varKey}
    //   name={partName + '.' + varKey}
    //   // floatingLabelText={partName + '.' + varKey}
    //   onChange={(e, i, value) => this.setLayout(partName, varKey, value)}
    //   value={this.state.layout[partName][varKey]} >
    //   { getItems(variations[varKey]) }

    //   <MenuItem key='default' value='' primaryText='' />
    // </Select>
  }

  addLayoutDropDown = layoutOption => {
    const results = []
    const variations = layoutOption.prototype.variations
    Object.keys(variations).map(varKey => {
      if (Object.prototype.hasOwnProperty.call(variations, varKey)) {
        try {
          results.push(this.addLayoutPropDropDown(layoutOption, varKey))
        } catch (exc) {
          console.error('error adding dropdown for ', layoutOption, varKey, exc)
        }
      }
    })
    return results
  }

  getDefaultInitials = () => {
    let result = ''
    if (this.state.text.brandName) {
      const words = this.state.text.brandName.match(WordResources.wordSplitRegEx)
      for (const word of words) {
        if (word && word.length > 0) {
          result += word[0].toUpperCase()
        }
      }
    }
    return result
  }

  createLogoGrid = () => {
    const result = []
    for (let i = 0; i < logoCount; i++) {
      result.push(
        <div className='logo-preview' key={`logo-${i}`} ref={this.logoDivs[i]} onClick={this.selectTemplate}>
          <i className='animate-button material-icons' onClick={event => this.handleAnimate(event, i)}>
            play_circle_filled
          </i>
        </div>
      )
    }
    return result
  }

  render = () => {
    return (
      <div className='logo-blender-main'>
        <div className='top-header'>
          <div className='text-settings-test'>
            {this.addLayoutDropDown(DecorationLayout)}
            {this.addLayoutDropDown(BrandLayout)}
            {this.addLayoutDropDown(SloganLayout)}
            {this.addLayoutDropDown(SymbolLayout)}
            <TextField
              key='brandname'
              label='brand name'
              onChange={e => this.setBrandName(e.target.value)}
              value={this.state.text.brandName}
              type='text'
            />
            <TextField
              key='slogan'
              label='slogan'
              onChange={e => this.setSlogan(e.target.value)}
              value={this.state.text.slogan}
              type='text'
            />
            <TextField
              key='intials'
              label='intials'
              onChange={e => this.setInitials(e.target.value)}
              value={this.state.text.initials}
              type='text'
            />
            <br />
            {this.createFontSettings('brand1')}
            {this.createFontSettings('brand2')}
            {this.createFontSettings('slogan')}
          </div>
          <div className='button-bar'>
            <Button key='regenerateButton' className='regenerateButton' onClick={e => this.regenerateLogos()}>
              regenerate
            </Button>
            <Button key='symbolsButton' className='symbolButton' onClick={e => this.showSymbols()}>
              symbols
            </Button>
            <Button key='fontsButton' className='symbolButton' onClick={e => this.showFonts()}>
              fonts
            </Button>
            <Button key='testButton' className='testButton' onClick={e => this.doTest()}>
              test
            </Button>
          </div>
          {this.state.showSymbolGrid ? (
            <div className='symbol-grid'>{this.createSymbolGrid()}</div>
          ) : (
            <div className='logo-grid'>{this.createLogoGrid()}</div>
          )}
        </div>

        <div className={this.state.whichGrid + '-grid'}>
          {this['create' + this.state.whichGrid[0].toUpperCase() + this.state.whichGrid.substring(1) + 'Grid']()}
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  setTemplate: templateDetails => dispatch(setTemplateActive(templateDetails))
})

const mapStateToProps = ({ onboarding }) => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(LogoBlenderMain)
