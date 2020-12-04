import Alert from 'core/components/Alert'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import React from 'react'

const PrometheusMonitoringField = ({ wizardContext = {} as any, setWizardContext }) => (
  <>
    <CheckboxField
      id="prometheusMonitoringEnabled"
      label="Monitoring"
      info="This deploys an instance of prometheus on the cluster."
    />
  </>
)

export default PrometheusMonitoringField

export function PrometheusMonitoringAddonField() {
  return (
    <Alert
      small
      type="card"
      variant="error"
      message="The PMK management plane cannot monitor your cluster's health."
    />
  )
}
