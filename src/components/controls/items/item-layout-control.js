import React, { useContext } from 'react'
import PropTypes from 'prop-types'

import LogoMakerContext from 'logomaker/context/editor-context'

import { styled } from '@mui/material/styles'

import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'

const ItemBlock = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px transparent;
  padding: 8px;
  padding-bottom: 7%;
  padding-top: 7%;
  position: relative;
  cursor: pointer;
  transition: box-shadow 0.45s cubic-bezier(0.23, 1, 0.32, 1) 0ms;
`

const ItemBlockGrid = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 4px 0px;
`

const ItemLayoutControl = ({ templateKey, label, options }) => {
  const { editorTemplate, updateValueInTemplate } = useContext(LogoMakerContext)
  const selectedItem = editorTemplate?.layout?.slogan?.style ?? ''

  return (
    <Grid container>
      <Grid  size={12}>
        <Typography
          style={{
            marginBottom: 8,
            marginTop: 8
          }}
          variant='body1'
        >
          {label}
        </Typography>
      </Grid>
      <Grid >
        <ItemBlockGrid>
          {options.map((option, index) => (
            <ItemBlock
              key={`${option.label}-${index}`}
              onClick={() =>
                updateValueInTemplate(
                  templateKey,
                  option.customSetter ? option.customSetter(selectedItem, option.value) : option.value
              )}
            >
              <option.item
                active={option.customComparitor?.(selectedItem, option.value) ?? option.value === selectedItem}
              />
            </ItemBlock>
          ))}
        </ItemBlockGrid>
      </Grid>
    </Grid>
  )
}

ItemLayoutControl.propTypes = {
  templateKey: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      label: PropTypes.string.isRequired,
      item: PropTypes.any
    })
  ).isRequired
}

export default ItemLayoutControl
