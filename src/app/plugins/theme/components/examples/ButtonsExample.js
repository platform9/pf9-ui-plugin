import React from 'react'
import CancelButton from 'core/components/buttons/CancelButton'
import CreateButton from 'core/components/buttons/CreateButton'
import NextButton from 'core/components/buttons/NextButton'
import NewEntryButton from 'core/components/buttons/NewEntryButton'
import PrevButton from 'core/components/buttons/PrevButton'
import SubmitButton from 'core/components/buttons/SubmitButton'
import Panel from '../Panel'
import ExternalLink from 'core/components/ExternalLink'
import CustomizeExpander from '../CustomizeExpander'
import ColorPicker from '../ColorPicker'
import { Button } from '@material-ui/core'

const ButtonsExample = ({ expanded = false }) => (
  <Panel title="Buttons" defaultExpanded={expanded}>
    <CreateButton>Add Cluster</CreateButton>

    <br />

    <CancelButton />
    <CancelButton disabled />

    <br />

    <SubmitButton />
    <SubmitButton disabled />

    <br />

    <PrevButton />
    <NextButton />

    <br />

    <NewEntryButton>New Key / Value Entry</NewEntryButton>

    <hr />

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
