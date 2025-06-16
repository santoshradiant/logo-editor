import React, { memo } from 'react'
import { styled } from '@mui/material/styles'
import  { css } from '@emotion/react'

import config from './config'

const randomItem = xs => xs[Math.floor(Math.random() * xs.length)]

const ContainerCard = styled('div')`
  height: 100%;
  width: 100%;

  .__inner {
    animation: shimmer 2.5s linear infinite forwards;
    background: #f6f7f9;
    background-image: linear-gradient(to right, #f6f7f9 0%, #e9ebee 20%, #f6f7f9 40%, #f6f7f9 100%);
    background-repeat: no-repeat;
    background-size: 70% 100%;
    height: 60%;
    width: 60%;
    margin: auto;
    margin-top: 10%;
    position: relative;

    div {
      background: #fff;
      height: 6px;
      left: 0;
      position: absolute;
      right: 0;

      ${props => {
    return props.configItem.map(
      (item, i) => css`
            &:nth-child(${i + 1}) {
              height: ${item.height};
              width: ${item.width};
              left: ${item.left};
              right: ${item.right};
              top: ${item.top};
            }
          `
    )
  }}
    }
  }
  @keyframes shimmer {
    0% {
      background-position: -500%;
    }
    100% {
      background-position: 500%;
    }
  }
`

const generateDivs = amount => {
  const res = []
  for (let i = 0; i < amount; i++) {
    res.push(<div key={i} />)
  }
  return res
}

export default memo(() => {
  const configItem = randomItem(config)
  return (
    <ContainerCard configItem={configItem}>
      <div className='__inner'>{generateDivs(configItem.length)}</div>
    </ContainerCard>
  )
})
