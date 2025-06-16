import React, { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'

import NavigationWrapper, { Navigation } from '@eig-builder/module-navigation'
import { LogoMaker } from '../../../logomaker'
import { goToWithHistory } from '@eig-builder/core-utils/helpers/go-to-helper'

import WIDTH_BREAKPOINTS, { useMediaQuery } from '@eig-builder/core-utils/hooks/useResponsiveQuery'

import useFreeFlow from 'hooks/useFreeFlow'

import { Editor, MobileEditor } from './editor'
import LogoBackButton from '../../../logomaker/components/logo-back-button'
import { useApplicationContext } from 'modules/application-config/index'
import NavigationWithContextContainer from './navigation-context-container'
import useSingletonUndoRedo from 'hooks/useSingletonUndoRedo'
import {
  partnerHasReadonlyBrandNameLock,
  logoIsReadonly,
  logoIsGeneratedLogo
} from '../../../modules/application-config/features'
import { useLogoById, useLogoUpdate, useLogos } from 'hooks/useLogo'

const parseLogo = (data) => ({
  ...data,
  logo: JSON.parse(data?.logo)
})

const EditorPage = () => {
  const { logoId } = useParams()

  const navigate = useNavigate()
  const { data: logo, isLoading } = useLogoById(logoId)
  const updateLogo = useLogoUpdate()
  const myLogos = useLogos()
  const [inverted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [firstRender, setFirstRender] = useState(true)
  const [_, setForceUpdate] = useState(true)
  const {
    state,
    set: AddHistory,
    undo: Undo,
    redo: Redo
  } = useSingletonUndoRedo({
    initialPresent: logo ? parseLogo(logo) : null
  })
  const { baseName } = useApplicationContext()

  const redirectUrl = baseName + '/transfer/' + logoId
  const test = useCallback(() => {
    goToWithHistory(navigate, redirectUrl)
  }, [redirectUrl])

  React.useEffect(() => {
    window.navigationState.drawer.next(false)
    window.navigationState.header.next(false)
  }, [])

  const [triggerFreeFlowAction] = useFreeFlow(window.location.origin + redirectUrl, test)

  const onScrollContent = useCallback(
    (propz) => {
      if (propz.currentTarget.scrollTop > 0 && scrolled !== true) {
        setScrolled(true)
      }
      if (propz.currentTarget.scrollTop <= 0 && scrolled !== false) {
        setScrolled(false)
      }
    },
    [scrolled]
  )

  const isMobile = useMediaQuery({ query: `(max-width: ${WIDTH_BREAKPOINTS.LARGE_DESKTOP}px)` })

  useEffect(() => {
    setFirstRender(false)
  }, [])

  // if readonly by default go to download page,
  // if partner has brandname Lock active continue but lock brandname input.
  // eslint-disable-next-line camelcase
  if (logoIsReadonly(logo) && !partnerHasReadonlyBrandNameLock) {
    goToWithHistory(navigate, '/logo/editor/' + logo?.id + '/download')
    return null
  }

  if (logoIsGeneratedLogo(logo)) {
    goToWithHistory(navigate, '/logo/onboarding?logoId=' + logo?.id + '&brandName=' + logo?.name + '&slogan=')
    return null
  }

  if (isLoading) {
    return null
  }

  return (
    <NavigationWrapper>
      {!logo ? (
        <Navigation.DetailBar>
          <Navigation.LeftAlign>
            <LogoBackButton />
          </Navigation.LeftAlign>
        </Navigation.DetailBar>
      ) : (
        <LogoMaker
          logos={myLogos.data ?? []}
          selectedLogo={logo}
          historyLogo={state.present}
          saveLogo={(logo) => {
            triggerFreeFlowAction('save')
            return updateLogo.mutateAsync({ logoId, logo })
          }}
          onChange={(lastElement) => {
            if (lastElement && !firstRender && JSON.stringify(state.present) !== JSON.stringify(lastElement)) {
              AddHistory(lastElement)
              triggerFreeFlowAction('history push')
            }
          }}
        >
          <NavigationWithContextContainer
            undo={() => {
              Undo()
              setForceUpdate((value) => !value)
            }}
            redo={() => {
              Redo()
              setForceUpdate((value) => !value)
            }}
            triggerFreeFlowAction={triggerFreeFlowAction}
            undoRedoState={state}
          />
          {isMobile ? (
            <MobileEditor
              loadingFulfilled={!isLoading}
              onScrollContent={onScrollContent}
              scrolled={scrolled}
              inverted={inverted}
            />
          ) : (
            <Editor
              loadingFulfilled={!isLoading}
              scrolled={scrolled}
              inverted={inverted}
              onScrollContent={onScrollContent}
            />
          )}
        </LogoMaker>
      )}
    </NavigationWrapper>
  )
}

export default EditorPage
