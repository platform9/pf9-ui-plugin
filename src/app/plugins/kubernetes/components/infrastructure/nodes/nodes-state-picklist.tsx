import React from 'react'
import PicklistDefault from 'core/components/Picklist'
import { NodeState } from './model'
const Picklist: any = PicklistDefault // types on forward ref .js file dont work well.

const options = [
  { label: 'Authorized', value: NodeState.Authorized },
  { label: 'Unauthorized', value: NodeState.Unauthorized },
]
const NodesStatePicklist = ({ onChange, ...rest }) => {
  return <Picklist {...rest} label="State" name="state" onChange={onChange} options={options} />
}

export default NodesStatePicklist
