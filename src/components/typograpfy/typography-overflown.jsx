import React, { useRef, useState, useEffect, useCallback } from 'react'
import { debounce } from 'lodash'
import Tooltip from '@mui/material/Tooltip'
import { TypographyStyled } from 'core/mfe/common/views'
import PropTypes from 'prop-types'

const TypographyOverflown = ({ title, children, TooltipProps, TypographyProps }) => {
  const textElementRef = useRef()
  const [hoverStatus, setHover] = useState(false)

  const compareSize = () => {
    const compare = textElementRef.current.scrollWidth > textElementRef.current.clientWidth
    setHover(compare)
  }
  const debouncedCompareSize = useCallback(debounce(compareSize, 200), [compareSize])

  useEffect(() => {
    compareSize()
    window.addEventListener('resize', debouncedCompareSize)
    return () => {
      window.removeEventListener('resize', debouncedCompareSize)
    }
  }, [debouncedCompareSize, compareSize])

  return (
    <Tooltip arrow placement='top' interactive {...TypographyProps} title={title} disableHoverListener={!hoverStatus}>
      <TypographyStyled noWrap ref={textElementRef} {...TooltipProps}>
        {children}
      </TypographyStyled>
    </Tooltip>
  )
}

TypographyOverflown.propTypes = {
  title: PropTypes.oneOf([PropTypes.string, PropTypes.node]),
  children: PropTypes.node,
  TooltipProps: PropTypes.object,
  TypographyProps: PropTypes.object
}

export default TypographyOverflown
