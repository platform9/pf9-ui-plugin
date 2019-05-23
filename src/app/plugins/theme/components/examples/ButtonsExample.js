import React from 'react'
import Panel from '../Panel'
import { Button } from '@material-ui/core'

const ButtonsExample = ({ expanded = false }) => (
  <Panel title="Buttons" defaultExpanded={expanded}>
    <Button variant="contained">Default</Button>
    <Button variant="contained" color="primary">Primary</Button>
    <Button variant="contained" color="secondary">Secondary</Button>
  </Panel>
)

export default ButtonsExample
