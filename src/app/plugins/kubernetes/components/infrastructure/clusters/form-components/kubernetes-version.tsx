import React from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'
import kubernetesVersionPicklist from '../../../common/kubernetes-version-picklist'

export default function KubernetesVersion({ wizardContext, setWizardContext }) {
  return (
    <PicklistField
      DropdownComponent={kubernetesVersionPicklist}
      id="kubernetesVersion"
      label="Kubernetes Version"
      onChange={(value) => setWizardContext({ kubernetesVersion: value })}
      value={wizardContext.kubernetesVersion}
      info=""
      disabled={false}
      required
    />
  )
}
