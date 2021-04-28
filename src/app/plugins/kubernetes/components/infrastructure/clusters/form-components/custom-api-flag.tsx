import React from 'react'
import TextField from 'core/components/validatedForm/TextField'

const CustomApiFlags = ({ wizardContext, setWizardContext }) => (
  <>
    <TextField
      value={wizardContext.apiServerFlags}
      onChange={(value) => setWizardContext({ apiServerFlags: value })}
      id="apiServerFlags"
      label="API Server Flags"
      info="Enter a comma separated list of supported kube-apiserver,example: --request-timeout=2m0s,--kubelet-timeout=20s"
    />
    <TextField
      value={wizardContext.schedulerFlags}
      onChange={(value) => setWizardContext({ schedulerFlags: value })}
      id="schedulerFlags"
      label="Scheduler Flags"
      info="Enter a comma separated list of supported kube-scheduler flags,example:--kube-api-burst=120,--log_file_max_size=3000"
    />
    <TextField
      value={wizardContext.controllerManagerFlags}
      onChange={(value) => setWizardContext({ controllerManagerFlags: value })}
      id="controllerManagerFlags"
      label="Controller Manager Flags"
      info="Enter a comma separated list of supported kube-controller-manager flags,example:--large-cluster-size-threshold=60,--concurrent-statefulset-syncs=10"
    />
  </>
)

export default CustomApiFlags
