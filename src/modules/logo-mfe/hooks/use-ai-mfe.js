import { useState, useEffect } from 'react'

import AuthUjwtHelper from 'helpers/auth-ujwt-helper'

const initMFE = async (theme, callback, selector, buttonText) => {
  const func =  window.StandAloneAi ?? (await window.System.import('StandAloneAi'))
  func.init({
    token: AuthUjwtHelper.token,
    data: {
      shouldCloseOnGenerate: true,
      promptId: '73896578-1917-4188-a959-84182da11f29',
      closeOnClickAway: true,
      popperProps: {
        placement: 'right',
        disablePortal: false,
        style: { zIndex: 1203 },
        modifiers: [
          {
            name: 'flip',
            enabled: true,
            options: {
              altBoundary: true,
              rootBoundary: 'viewport',
              padding: 8
            }
          },
          {
            name: 'preventOverflow',
            enabled: true,
            options: {
              altAxis: true,
              altBoundary: true,
              tether: false,
              rootBoundary: 'viewport',
              padding: 8
            }
          }
        ]
      },
      buttonProps: {
        variant: 'text',
        text: buttonText,
        isicononly: 'true'
      }
    },
    theme: theme?.v5,
    callbacks: {
      refreshAccessToken: AuthUjwtHelper.refreshCallback,
      onGenerateContent: val => {
        callback(val)
      }
    },
    selector: selector
  })
}

const useAI = theme => {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    if (theme) {
      const prefix = process.env.Node_ENV === 'production' ? '' : '-uat'
      const src = `https://mfe${prefix}.newfold-addons.io/ai-content-generator/ai-mfe-loader.js`
      let script = document.getElementById('ai-loader-script')
      if (!script) {
        script = document.createElement('script')
        script.setAttribute('src', src)
        script.setAttribute('id', 'ai-loader-script')
        document.head.appendChild(script)

        script.addEventListener('load', async () => {
          const func = window.StandAloneAiLoader ?? (await window.System.import('StandAloneAiLoader'))
          await func.loadScripts('ai-mfe@1')
          setLoaded(true)
        })
      } else {
        setLoaded(true)
      }
    }
  }, [theme])

  const initAI = (selector, callback, buttonText = '') => initMFE(theme, callback, selector, buttonText)
  return { isLoadedAI: loaded, initAI }
}

export default useAI
