import CheckboxField from 'core/components/validatedForm/CheckboxField'
import React from 'react'

const MetricsServer = ({ wizardContext, setWizardContext }) => (
  <CheckboxField
    id="metricsServer"
    label="Metrics Server"
    info="Kubernetes Metrics Server "
    infoPlacement="right-end"
    value={wizardContext.metricsServer}
    onChange={(value) => setWizardContext({ metricsServer: value })}
  />
)

export default MetricsServer
