import React from 'react'

import Grid from '@mui/material/Grid2'

import Skeleton from '@mui/material/Skeleton'

import times from 'lodash/times'

import { styled } from '@mui/material/styles'

const LoadingContainer = styled('div')`
  margin: ${({ theme }) => theme.spacing(5, 2, 0, 2)};
`

const Row = styled(Grid)`
  padding: ${({ theme }) => theme.spacing(6)};
`

const LoadingGrid = () => {
  return (
    <LoadingContainer>
      {times(4, (index) => (
        <Grid container spacing={2} key={`skeleton-${index}`}>
          {times(3, (index2) => (
            <Row  size={{ xs: 6, lg: 4 }} key={`sub-skeleton-${index2}`}>
              <Skeleton variant='rect' width='100%' height={190} />
            </Row>
          ))}
        </Grid>
      ))}
    </LoadingContainer>
  )
}

export default LoadingGrid
