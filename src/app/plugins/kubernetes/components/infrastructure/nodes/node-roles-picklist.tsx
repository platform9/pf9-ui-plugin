import React from 'react'
import PicklistDefault from 'core/components/Picklist'
const Picklist: any = PicklistDefault // types on forward ref .js file dont work well.

const options = [
  { label: 'Master', value: 'master' },
  { label: 'Worker', value: 'worker' },
]
const NodeRolesPicklist = ({ onChange, ...rest }) => {
  return <Picklist {...rest} label="Role" name="role" onChange={onChange} options={options} />
}

export default NodeRolesPicklist
