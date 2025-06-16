import { Localizations } from '@eig-builder/module-localization'

Localizations.append({
  logomaker: {
    advancedControls: 'Advanced controls',
    backToExpressEditor: 'Back to site editor',
    controlsTitle: 'Logo settings',
    variationTitle: 'Variations',
    variationSubtitle: 'Not feeling it yet? Here are a some alternatives to choose from.',
    save: 'Save',
    saved: 'Saved',
    saving: 'Saving',
    replace: 'Replace symbol',
    addSymbol: 'Add symbol',
    add: 'Add',
    theme: 'Theme',
    preview: 'Preview',
    colorsPopover: {
      title: 'Pick your color palette',
      cancel: 'Cancel',
      loadMore: 'Load More'
    },
    deleteLogo: {
      header: 'Are you sure you want to delete your logo?',
      content: 'You are about to delete your logo. Once deleted you will not be able to undo this action.'
    },
    expresseditor: {
      save: 'Upload logo to my site'
    },
    inspirations: {
      site: {
        label: 'Site'
      },
      instagram: {
        label: 'Instagram'
      },
      facebook: {
        label: 'Facebook'
      },
      card: {
        label: 'Businesscard'
      },
      shirt: {
        label: 'T-Shirt'
      },
      bag: {
        label: 'Totebag'
      },
      backpack: {
        label: 'Backpack'
      },
      beer: {
        label: 'Coaster'
      },
      cap: {
        label: 'Cap'
      },
      display: {
        label: 'Sign'
      },
      mug: {
        label: 'Mug'
      },
      sticker: {
        label: 'Sticker'
      }
    },
    colors: {
      cancel: 'Cancel',
      apply: 'Apply'
    },
    segments: {
      noSelected: {
        title: 'This is your logo',
        subtitle: 'Click on one of the segments in the right panel to change the logo'
      },
      name: {
        label: 'Name',
        title: 'Change how your brand name looks',
        subtitle: 'Click on the part of your logo you want to change',
        brandName: 'Brand name',
        layout: 'Layout',
        capitalize: 'Capitalize',
        alignment: 'Alignment',
        fontStyle: 'Font style',
        fontSize: 'Font size',
        letterSpacing: 'Letter spacing',
        lineHeight: 'Line height',
        duoColorPosition: 'Color mix',
        alignHorizontal: 'Horizontal',
        alignVertical: 'Vertical'
      },
      slogan: {
        label: 'Slogan',
        title: 'Change your slogan',
        subtitle: 'Click on the part of your logo you want to change',
        name: 'Slogan (optional)',
        size: 'Font size',
        spacing: 'Letter spacing',
        lineHeight: 'Line height',
        lineCount: 'Line count'
      },
      symbol: {
        label: 'Symbol',
        select: 'Select your symbol',
        title: 'Change your symbol',
        subtitle: 'Click on the part of your logo you want to change',
        symbolBased: 'Symbol based',
        initialBased: 'Initials based'
      },
      color: {
        label: 'Colors',
        header: {
          title: 'Logo colors',
          action: 'Explore colors'
        },
        title: 'Change the colors',
        subtitle: 'Click on the part of your logo you want to change'
      },
      fonts: {
        label: 'Fonts',
        title: 'Change the fonts',
        subtitle: 'Click on the part of your logo you want to change'
      },
      merch: {
        label: 'Merch',
        title: 'Design your Merch',
        subtitle: 'Click on the part of your logo you want to change',
        merchSelect: 'Type of Merchandise'
      },
      shape: {
        label: 'Shape',
        title: 'Change the shape',
        subtitle: 'Click on the part of your logo you want to change',
        showShape: 'Show shape',
        filled: 'Filled',
        lineWidth: 'Line width',
        strokeDistance: 'Margin',
        cornerRadius: 'Roundness'
      },
      cardText: {
        label: 'Text',
        title: 'Edit text on your business card',
        subtitle: 'Click on the part of your business card you want to change'
      },
      cardBackground: {
        label: 'Background',
        title: 'Change the background on your business card',
        subtitle: 'Click on the part of your business card you want to change'
      },
      cardFront: {
        label: 'Front',
        title: 'Change the front layout of your business card',
        subtitle: 'Click on the part of your business card you want to change'
      },
      cardBack: {
        label: 'Back',
        title: 'Change the back layout of your business card',
        subtitle: 'Click on the part of your business card you want to change'
      },
      card: {
        label: 'Card',
        title: 'Edit your business card',
        subtitle: 'Click on the part of your business card you want to change',
        name: 'Your own name',
        function: 'Your function',
        phone: 'Phone number',
        email: 'E-mail address',
        address1: '1st address line',
        address2: '2nd address line',
        wwwTitle: 'Websites address',
        titleSize: 'Title size',
        size: 'Text size',
        // spacing: 'Letter spacing',
        // lineHeight: 'Line height',
        showSideLabel: 'Card side',
        showFront: 'Front',
        showBack: 'Back'
      },
      alignment: {
        disabled: 'Alignment and line options are only available for shorter or smaller slogans.'
      }
    },
    previewLogo: {
      colors: 'Colors:',
      fonts: 'Fonts:'
    },
    duplicateLogo: {
      header: 'Duplicate',
      content: 'Do you want to duplicate this logo?'
    },
    symbolSearch: {
      label: 'Search a symbol'
    },
    designerModal: {
      header: {
        success: 'Success!',
        error: 'Oops!'
      },
      content: {
        success: 'Your votes has been sent successfully.',
        error: 'You already guessed it.. something went wrong.'
      }
    },
    deleteModal: {
      header: {
        success: 'Success!',
        error: 'Oops!'
      },
      content: {
        success: 'Your votes has been deleted successfully.',
        error: 'You already guessed it.. something went wrong.'
      }
    },
    colorWarnings: {
      warning1_1: 'This color will result in',
      warning1_bold: 'low-contrast',
      warning1_2: 'with the elements background, it is not advised to use it.',

      warning2:
        'This color is used for the shape, selecting this color will change the color of the shape to prevent contrast issues.',
      warning3:
        'This color is used in elements on your shape, selecting this color will change the color of the conflicting elements to prevent contrast issues.',
      warning4: 'This color can\'t be applied because it\'s the same color as the background.',

      warning5_1: 'This color will result in',
      warning5_bold: 'low-contrast',
      warning5_2: 'with some elements on the shape, it is not advised to use it.'
    }
  }
})
