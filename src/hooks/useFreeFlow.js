import { useCallback, useEffect, useState } from 'react'
import { isUsingFullOnboardingFlow, useApplicationContext } from 'modules/application-config'
// Validators before the free account box to pop in.
// They return a string so we can track the reasons why it got triggered.
function has10Triggers (stack) {
  return stack.length >= 10 && 'had 10 triggers'
}

function hasFreeFlow (stack) {
  return stack.includes('freeflow') && 'had free flow trigger'
}

function hasDownloadTriggers (stack) {
  return stack.includes('download') && 'had download trigger'
}

function hasPreviewTriggers (stack) {
  return stack.includes('preview') && 'had preview trigger'
}

function hasSaveTriggers (stack) {
  return stack.includes('save') && 'had save trigger'
}

const validators = [has10Triggers, hasDownloadTriggers, hasSaveTriggers, hasPreviewTriggers, hasFreeFlow]

function useFreeFlow (redirectUrl, callback) {
  const context = useApplicationContext()
  const { setAuthFlow, setAuthenticationCallBack, setAuthenticatedReturnUrl, isAuthenticated } = context
  const [triggerStack, setTriggerStack] = useState([])

  if (!callback || !redirectUrl) {
    throw Error('You must pass an callback and returnUrl to the useFreeFlow hook')
  }

  useEffect(() => {
    setAuthenticationCallBack && setAuthenticationCallBack(callback)
    setAuthenticatedReturnUrl && setAuthenticatedReturnUrl(redirectUrl)
  }, [setAuthenticationCallBack, setAuthenticatedReturnUrl, redirectUrl]) // eslint-disable-line

  const checkStack = useCallback(
    (stack = []) => {
      if (isAuthenticated || isUsingFullOnboardingFlow()) {
        return false
      }
      let oneCheckMatches = false
      validators.map(validator => {
        if (validator(stack)) {
          oneCheckMatches = true
        }
      })
      return oneCheckMatches
    },
    [isAuthenticated]
  )

  useEffect(() => {
    if (checkStack()) {
      setAuthFlow(true)
    }
  }, [setAuthFlow, checkStack])

  // Trigger an change to the stack. when then the validators match the callback wont be called. the popup will be thrown.
  function setFreeFlowTrigger (triggerName, callback) {
    const newStack = [...triggerStack, triggerName]
    setTriggerStack(newStack)
    if (checkStack(newStack)) {
      setAuthFlow(true)
    } else {
      callback && callback()
    }
  }

  return [setFreeFlowTrigger, context.setAuthenticationCallBack, context.setAuthFlow]
}

export default useFreeFlow
