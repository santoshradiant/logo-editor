import React, { Fragment, memo, useContext } from 'react'
import Controls from './index'
import LogoMakerContext from 'logomaker/context/editor-context'
import LayoutControls from './items/symbol-layout-control'
import Divider from '@mui/material/Divider'

import get from 'lodash/get'

let initialSymbol = {
  decoration: 'none',
  position: 'top'
}

const none = {
  decoration: 'none',
  position: 'none'
}

const SymbolControls = () => {
  const logoMakerContext = useContext(LogoMakerContext)
  const toggleSymbol = value => {
    if (!value) {
      initialSymbol = logoMakerContext.editorTemplate.layout.symbol
      logoMakerContext.updateValueInTemplate('layout.symbol', none)
    } else {
      logoMakerContext.updateValueInTemplate('layout.symbol', initialSymbol)
    }
    logoMakerContext.triggerVariationsUpdate()
  }

  const showSymbol = get(logoMakerContext.editorTemplate, 'layout.symbol.position') !== 'none'

  return (
    <Controls.Container>
      <Controls.CurrentIconControl label='Current symbol' templateKey='symbol.icon' />
      <Controls.SwitchControl label='Show symbol' value={showSymbol} onToggle={toggleSymbol} />

      <Controls.Conditional condition={showSymbol}>
        <Controls.FieldWrapper>
          <Controls.SliderControl label='Size' templateKey='symbol.size' min={0.5} max={2} />
        </Controls.FieldWrapper>
        <Controls.FieldWrapper>
          <Controls.SliderControl label='Margin' templateKey='symbol.margin' min={0.25} max={4} />
        </Controls.FieldWrapper>
      </Controls.Conditional>

      <Controls.Conditional templateKey='symbol.icon'>
        <Fragment>
          <Divider />
          <LayoutControls />
        </Fragment>
      </Controls.Conditional>
    </Controls.Container>
  )
}

export default memo(SymbolControls)
