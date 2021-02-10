import React from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'
import NamespacePicklistDefault from 'k8s/components/common/NamespacePicklist'
const NamespacePicklist: any = NamespacePicklistDefault

export default function NamespacePicklistField({
  clusterId,
  addNewItemOption = false,
  addNewItemHandler = undefined,
  label = 'Namespace',
}) {
  return (
    <PicklistField
      DropdownComponent={NamespacePicklist}
      id="namespace"
      label={label}
      selectFirst={false}
      clusterId={clusterId}
      addNewItemOption={addNewItemOption}
      addNewItemOptionLabel="Add new namespace"
      disabled={!clusterId}
      addNewItemHandler={addNewItemHandler}
      required
    />
  )
}
