import React from 'react'
import ColorPicker from './ColorPicker'
import Panel from './Panel'

const ColorsPanel = () => (
  <Panel title="Palette" defaultExpanded>
    <ColorPicker path="palette.common.white" />
    <ColorPicker path="palette.common.black" />
    <br />

    <ColorPicker path="palette.background.paper" />
    <ColorPicker path="palette.background.default" />
    <br />

    <ColorPicker path="palette.primary.light" />
    <ColorPicker path="palette.primary.main" />
    <ColorPicker path="palette.primary.dark" />
    <ColorPicker path="palette.primary.contrastText" />
    <br />

    <ColorPicker path="palette.secondary.light" />
    <ColorPicker path="palette.secondary.main" />
    <ColorPicker path="palette.secondary.dark" />
    <ColorPicker path="palette.secondary.contrastText" />
    <br />

    <ColorPicker path="palette.sidebar.background" />
    <ColorPicker path="palette.sidebar.text" />
    <br />

    <ColorPicker path="palette.error.light" />
    <ColorPicker path="palette.error.main" />
    <ColorPicker path="palette.error.dark" />
    <ColorPicker path="palette.error.contrastText" />
    <br />

    <ColorPicker path="palette.text.primary" />
    <ColorPicker path="palette.text.secondary" />
    <ColorPicker path="palette.text.disabled" />
    <ColorPicker path="palette.text.hint" />
    <br />
  </Panel>
)

export default ColorsPanel
