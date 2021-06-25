import React from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'
import KubernetesVersionPicklist from 'k8s/components/common/kubernetes-version-picklist'

export default function KubernetesVersion({ required = true, ...props }) {
  return (
    <PicklistField
      {...props}
      DropdownComponent={KubernetesVersionPicklist}
      id="kubeRoleVersion"
      label="Kubernetes Version"
      required={required}
    />
  )
}
