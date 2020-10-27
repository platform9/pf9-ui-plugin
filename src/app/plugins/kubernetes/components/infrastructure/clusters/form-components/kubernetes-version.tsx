import React from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'
import KubernetesVersionPicklist from 'k8s/components/common/kubernetes-version-picklist'

export default function KubernetesVersion({ wizardContext, setWizardContext }) {
  return (
    <PicklistField
      DropdownComponent={KubernetesVersionPicklist}
      id="kubernetesVersion"
      label="Kubernetes Version"
      onChange={(value) => setWizardContext({ kubernetesVersion: value })}
      value={wizardContext.kubernetesVersion}
      required
    />
  )
}
