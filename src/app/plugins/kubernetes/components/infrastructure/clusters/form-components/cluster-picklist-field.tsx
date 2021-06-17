import React from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'
import ClusterPicklistDefault from 'k8s/components/common/ClusterPicklist'
const ClusterPicklist: any = ClusterPicklistDefault

export default function ClusterPicklistField({ onChange }) {
  return (
    <PicklistField
      DropdownComponent={ClusterPicklist}
      id="clusterId"
      label="Cluster"
      onChange={onChange}
      selectFirst={false}
      required
    />
  )
}
