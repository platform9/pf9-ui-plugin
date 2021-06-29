import CheckboxField from 'core/components/validatedForm/CheckboxField'
import React from 'react'

const KubernetesDashboard = ({ wizardContext, setWizardContext }) => (
  <CheckboxField
    id="kubernetesDashboard"
    label="Kubernetes Dashboard"
    info="Opensource Kubernetes Dashboard"
    infoPlacement="right-end"
    value={wizardContext.kubernetesDashboard}
    onChange={(value) => setWizardContext({ kubernetesDashboard: value })}
  />
)

export default KubernetesDashboard
