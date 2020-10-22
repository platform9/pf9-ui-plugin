import Alert from 'core/components/Alert'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import React from 'react'

export default ({ values }) => (
  <>
    <CheckboxField
      id="prometheusMonitoringEnabled"
      label="Enable monitoring with prometheus"
      info="This deploys an instance of prometheus on the cluster."
    />

    {!values.prometheusMonitoringEnabled && (
      <Alert
        small
        variant="error"
        message="The PMK management plane will not be able to monitor the cluster health."
      />
    )}
  </>
)
