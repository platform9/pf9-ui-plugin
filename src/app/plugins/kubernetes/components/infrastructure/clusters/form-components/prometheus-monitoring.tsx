import Alert from 'core/components/Alert'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import React from 'react'

const PrometheusMonitoringField = ({ wizardContext, setWizardContext }) => (
  <>
    <CheckboxField
      id="prometheusMonitoringEnabled"
      label="Enable monitoring with prometheus"
      info="This deploys an instance of prometheus on the cluster."
      onChange={(value) => setWizardContext({ prometheusMonitoringEnabled: value })}
    />

    {!wizardContext.prometheusMonitoringEnabled && (
      <Alert
        small
        variant="error"
        message="The PMK management plane will not be able to monitor the cluster health."
      />
    )}
  </>
)

export default PrometheusMonitoringField
