import CheckboxField from 'core/components/validatedForm/CheckboxField'
import React from 'react'

export const kubernetesDashboardFieldId = 'enableKubernetesDashboard'

const KubernetesDashboard = ({ wizardContext, setWizardContext }) => (
  <CheckboxField
    id={kubernetesDashboardFieldId}
    label="Kubernetes Dashboard"
    info="Opensource Kubernetes Dashboard"
    infoPlacement="right-end"
    value={wizardContext[kubernetesDashboardFieldId]}
    onChange={(value) => setWizardContext({ [kubernetesDashboardFieldId]: value })}
  />
)

export default KubernetesDashboard
