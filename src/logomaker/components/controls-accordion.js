import React, { memo } from 'react'
import { useEditorContext } from '../context/editor-context'

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AccordionDetails from '@mui/material/AccordionDetails';

const ControlsAccordion = () => {
  const { segments, activeSegment, setActiveSegment } = useEditorContext()
  return (
    <div>
      {segments.map((segment, index) => {
        const { name, label, control: Component } = segment
        const active = name === activeSegment
        const setActive = () => setActiveSegment(name)
        return (
          <Accordion elevation={1} square expanded={active} key={index} onChange={setActive}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h4'>{label}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Component />
            </AccordionDetails>
          </Accordion>
        )
      })}
    </div>
  )
}

export default memo(ControlsAccordion)
