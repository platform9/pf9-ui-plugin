import React from 'react'
import Panel from '../Panel'
import ExternalLink from 'core/components/ExternalLink'
import CustomizeExpander from '../CustomizeExpander'
import ColorPicker from '../ColorPicker'
import { Button } from '@material-ui/core'

const ButtonsExample = ({ expanded = false }) => (
  <Panel title="Buttons" defaultExpanded={expanded}>
    <Button variant="contained">Default</Button>
    <Button variant="contained" color="primary">Primary</Button>
    <Button variant="contained" color="secondary">Secondary</Button>

    <CustomizeExpander>
      <ColorPicker path="palette.grey.300" />
      <ColorPicker path="palette.primary.main" />
      <ColorPicker path="palette.secondary.main" />
      <ColorPicker path="palette.primary.contrastText" />
      <ColorPicker path="palette.secondary.contrastText" />

      <br />
      <br />

      <ExternalLink url="https://material-ui.com/components/buttons/" newWindow>Material-UI Docs</ExternalLink>
      <br />
      <ExternalLink url="https://material-ui.com/api/button/" newWindow>Material-UI API</ExternalLink>
    </CustomizeExpander>

  </Panel>
)

export default ButtonsExample
