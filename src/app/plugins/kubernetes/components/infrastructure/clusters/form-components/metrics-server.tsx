import CheckboxField from 'core/components/validatedForm/CheckboxField'
import React from 'react'

export const metricsServerFieldId = 'enableMetricsServer'

const MetricsServer = ({ wizardContext, setWizardContext }) => (
  <CheckboxField
    id={metricsServerFieldId}
    label="Metrics Server"
    info="Kubernetes Metrics Server "
    infoPlacement="right-end"
    value={wizardContext[metricsServerFieldId]}
    onChange={(value) => setWizardContext({ [metricsServerFieldId]: value })}
  />
)

export default MetricsServer
