import CheckboxField from 'core/components/validatedForm/CheckboxField'
import React from 'react'

export const awsAutoScalingFieldId = 'enableCAS'

const AwsAutoScalingField = ({wizardContext, setWizardContext}) => (
  <CheckboxField
    id={awsAutoScalingFieldId}
    label="Enable Auto Scaling"
    value={wizardContext[awsAutoScalingFieldId]}
    onChange={(value) => setWizardContext({ [awsAutoScalingFieldId]: value })}
    info="Auto scaling may not be used with spot instances."
  />
)

export default AwsAutoScalingField