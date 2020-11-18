import React from 'react'
import PicklistDefault from 'core/components/Picklist'
const Picklist: any = PicklistDefault // types on forward ref .js file dont work well.

const options = [
  { label: 'Authorized', value: 'authorized' },
  { label: 'Unauthorized', value: 'unauthorized' },
]
const NodesStatePicklist = ({ onChange, ...rest }) => {
  return <Picklist {...rest} label="State" name="state" onChange={onChange} options={options} />
}

export default NodesStatePicklist
