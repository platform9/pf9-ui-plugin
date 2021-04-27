import React from 'react'
import TextField from 'core/components/validatedForm/TextField'

const CustomApiFlags = ({ wizardContext, setWizardContext }) => (
  <>
    <TextField
      value={wizardContext.apiServerFlags}
      onChange={(value) => setWizardContext({ apiServerFlags: value })}
      id="apiServerFlags"
      label="API Server Flags"
    />
    <TextField
      value={wizardContext.schedulerFlags}
      onChange={(value) => setWizardContext({ schedulerFlags: value })}
      id="schedulerFlags"
      label="Scheduler Flags"
    />
    <TextField
      value={wizardContext.controllerManagerFlags}
      onChange={(value) => setWizardContext({ controllerManagerFlags: value })}
      id="controllerManagerFlags"
      label="Controller Manager Flags"
    />
  </>
)

export default CustomApiFlags
