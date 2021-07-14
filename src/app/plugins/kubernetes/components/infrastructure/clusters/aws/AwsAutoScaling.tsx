import CheckboxField from 'core/components/validatedForm/CheckboxField'
import React from 'react'

export const awsAutoScalingFieldId = 'enableCAS'

const AwsAutoScalingField = () => (
  <CheckboxField
    id={awsAutoScalingFieldId}
    label="Enable Auto Scaling"
    info="Auto scaling may not be used with spot instances."
  />
)

export default AwsAutoScalingField