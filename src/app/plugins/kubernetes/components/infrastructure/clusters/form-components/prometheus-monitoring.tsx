import Alert from 'core/components/Alert'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import React from 'react'

const PrometheusMonitoringField = ({ wizardContext = {} as any }) => (
  <>
    <CheckboxField
      id="prometheusMonitoringEnabled"
      label="Monitoring"
      info="This deploys an instance of prometheus on the cluster."
    />

    {wizardContext.prometheusMonitoringEnabled === false && (
      <Alert
        small
        variant="error"
        message="The PMK management plane will not be able to monitor the cluster health."
      />
    )}
  </>
)

export default PrometheusMonitoringField

export function PrometheusMonitoringAddonField() {
  return (
    <Alert
      small
      variant="error"
      message="The PMK management plane cannot monitor your cluster's health."
    />
  )
}
