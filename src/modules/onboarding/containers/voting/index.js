import React, { memo, useCallback, useState } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router'
import isEmpty from 'lodash/isEmpty'

import { OkCancel } from '@eig-builder/module-modals/helpers'

import Grid from '@mui/material/Grid2'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

import CheckBoxIcon from 'core/components/checkbox-icon'
import LogoInstance from 'core/logo-maker/logo-instance'
import { useVoteLogo, useDeleteLogo } from 'hooks/useVotes'

import { useModalContext } from '@eig-builder/module-modals/withModalContext'

import '../../../../logomaker/lang'
import Text from '@eig-builder/module-localization'

import {
  LogoWrapper,
  Header,
  HoverCard,
  LogoPreview,
  Overlay,
  Subtitle,
  ButtonWrapper,
  DeleteButton,
  MoreButton
} from './styled-components'

// TODO MAKE THIS IN TO A GENERAL COMP
const MULTISELECT = true
const windowItems = () => Math.round(window.innerHeight / 320) * 3

const VotingGrid = ({ history }) => {
  const [selectedLogoCards, setSelectedLogoCards] = useState([])
  const [maxItems, setMaxItems] = useState(windowItems())
  const { data, isLoading, invalidateQueries } = useVoteLogo()
  const { dispatch: modalDispatch } = useModalContext()

  const callback = () => {
    const status = deleteState.status

    const title = getModalText(status)
    const content = getModalText(status)

    setSelectedLogoCards([])

    OkCancel({
      title: <Text message={`logomaker.deleteModal.header.${title}`} />,
      content: <Text message={`logomaker.deleteModal.content.${content}`} />,
      ok: () => invalidateQueries()
    })(modalDispatch)
  }
  const deleteState = useDeleteLogo(callback)

  const [buttonRef, setButtonRef] = useState(null)

  // show dialog with info hen delete call succeeded or not

  const selectLogo = useCallback(
    (logoId, template) => {
      let logos = MULTISELECT ? [...selectedLogoCards] : []

      // check if we re-select the same card
      // if so, remove it from the internal 'selected cards' state
      // if not, add it to the 'selected cards' state
      if (selectedLogoCards.find((x) => x.id === logoId)) {
        selectedLogoCards.forEach((logo) => {
          if (logoId === logo.id) {
            logos = selectedLogoCards.filter((logo) => logo.id !== logoId)
          }
        })
      } else {
        logos.push({
          id: logoId,
          data: template
        })
      }

      setSelectedLogoCards(logos)
    },
    [selectedLogoCards]
  )

  // build logo html in the card
  const fillRef = (variation, el) => {
    if (!el) {
      return
    }
    let instance
    if (!el.dataLogoAdded) {
      instance = new LogoInstance(variation, el, { isVariation: true })
      el.dataLogoAdded = instance
    } else {
      instance = el.dataLogoAdded
    }
  }

  const showLoadingOverlay = () => {
    const loaderStyle = {
      position: 'absolute',
      left: 'calc(50% - 40px / 2)',
      top: 'calc(50% - 40px / 2)',
      zIndex: 3
    }

    return (
      <React.Fragment>
        <Overlay />
        {!MULTISELECT && <CircularProgress style={loaderStyle} centered />}
      </React.Fragment>
    )
  }

  const createLogoGrid = () => {
    if (isLoading) {
      return (
        <Subtitle>
          <Typography className='pl-4 pr-2 pt-1' variant='body1'>
            Wait a sec.. 🙄 getting logos
          </Typography>
          <CircularProgress size={14} />
        </Subtitle>
      )
    }

    if (!isLoading) {
      if (!isEmpty(data)) {
        const someLogos = data.reverse().slice(0, maxItems)

        return someLogos.map((logo, i) => {
          if (logo.template !== 'example') {
            const template = JSON.parse(logo.template)
            const clicked = selectedLogoCards.some((selected) => selected.id === logo.id)

            return (
              <Grid key={`voted_logo_${i}`} size={4}>
                <HoverCard selected={clicked} onClick={() => selectLogo(logo.id, template)}>
                  <LogoPreview ref={(el) => fillRef(template, el)} />
                  {clicked && showLoadingOverlay()}
                  {clicked && <CheckBoxIcon />}
                </HoverCard>
              </Grid>
            )
          }
        })
      } else if (isEmpty(data)) {
        return (
          <Subtitle>
            <Typography className='pl-4 pr-2 pt-1' variant='body1'>
              No logo's found.. 😭
            </Typography>
          </Subtitle>
        )
      }
    }
  }

  const getModalText = (status) => {
    if (status === 200) {
      return 'success'
    }

    return 'error'
  }

  const getRemainingLogos = () => {
    if (!isEmpty(data) && !isEmpty(data)) {
      const remainingLogos = data.reverse().slice(0, maxItems)
      return data.length - remainingLogos.length
    }
  }

  const getTotalLogos = () => {
    if (!isEmpty(data)) {
      return data.length
    }
  }

  const totalLogos = getTotalLogos()
  const remainingLogos = getRemainingLogos()

  return (
    <>
      <LogoWrapper>
        <Header>
          <Typography className='pt-3 pl-3 pr-2' variant='h3' gutterBottom>
            Voted Logos {totalLogos && `(${totalLogos}/${remainingLogos})`}
          </Typography>
        </Header>
        <Grid container spacing={8} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          {createLogoGrid()}
        </Grid>
        <div ref={setButtonRef} style={{ paddingTop: 70 }} />
      </LogoWrapper>
      <ButtonWrapper>
        {totalLogos - maxItems > 0 && (
          <MoreButton
            color='primary'
            variant='outlined'
            onClick={(e) => {
              setMaxItems(maxItems + windowItems())
              const target = buttonRef
              window.setTimeout(
                () =>
                  target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'end'
                  }),
                300
              )
            }}
          >
            More ({totalLogos - maxItems < windowItems() ? totalLogos - maxItems : windowItems()})
          </MoreButton>
        )}
        {selectedLogoCards && selectedLogoCards.length > 0 && (
          <DeleteButton
            variant='contained'
            disabled={selectedLogoCards.length === 0 || isLoading}
            showLoader={deleteState.isLoading}
            onClick={deleteState.mutate}
          >
            {deleteState.isLoading
              ? 'Deleting..'
              : `Delete ${selectedLogoCards && selectedLogoCards.length > 0 ? `(${selectedLogoCards.length})` : ''}`}
          </DeleteButton>
        )}
      </ButtonWrapper>
    </>
  )
}

VotingGrid.propTypes = {
  history: PropTypes.object.isRequired
}

export default memo(withRouter(VotingGrid))
