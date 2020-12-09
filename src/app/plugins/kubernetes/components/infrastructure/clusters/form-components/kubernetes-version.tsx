import React from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'
import KubernetesVersionPicklist from 'k8s/components/common/kubernetes-version-picklist'

export default function KubernetesVersion() {
  return (
    <PicklistField
      DropdownComponent={KubernetesVersionPicklist}
      id="kubeRoleVersion"
      label="Kubernetes Version"
      required
    />
  )
}
