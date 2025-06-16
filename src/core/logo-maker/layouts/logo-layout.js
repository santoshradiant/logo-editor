import AMCore from '../amcore'
import DecorationLayout from './decoration-layout'
import BaseLayout from './layout-base'

class LogoLayout extends BaseLayout {
  constructor (settings, options) {
    super(settings, options)
    // this.settings.layout.brand.alignment = 'vertical'
    this.decorationLayout = new DecorationLayout(this.settings, this.options)
  }

  getLayout () {
    const decorationLayout = this.decorationLayout ? this.decorationLayout.getLayout() : undefined

    return AMCore.clone({
      type: 'group',
      tag: 'logo-layout-root',
      position: {
        left: 0.0,
        top: 0.0,
        width: 1.0,
        height: 1.0
      },
      layers: [decorationLayout]
    })
  }
}

export default LogoLayout
