// Logo mocked up in en environment. As a billboard or on a coffee cup.

import React from 'react'
import PropTypes from 'prop-types'
import book from './images/book.png'

// Bg image is dynamic,, local storage
const LogoMockup = props => (
  <div className='mockup-container book'>
    <svg xmlnsXlink='http://www.w3.org/1999/xlink' viewBox='0 0 1000 1000' {...props}>
      <defs>
        <svg width={517} height={517} id='logo'>
          {props.logo}
        </svg>
      </defs>
      <image xlinkHref={book} width={1300} y={200} height={600} />
      <image
        xlinkHref={props.logo}
        width={160}
        height={230}
        x={-350}
        y={530}
        transform='rotate(-35 80 120) skewX(27)'
      />
    </svg>
  </div>
)

LogoMockup.propTypes = {
  logo: PropTypes.any,
  display: PropTypes.string
}

export default LogoMockup
