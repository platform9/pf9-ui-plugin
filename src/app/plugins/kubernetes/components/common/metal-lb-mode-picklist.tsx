import React from 'react'
import PicklistDefault from 'core/components/Picklist'
const Picklist: any = PicklistDefault // types on forward ref .js file dont work well.

export enum MetalLbModes {
  Layer2Mode = 'layer2',
  BGPMode = 'bgp',
}

const options = [
  { label: 'Layer 2 Mode', value: MetalLbModes.Layer2Mode },
  { label: 'BGP Mode', value: MetalLbModes.BGPMode },
]

const MetalLbModePicklist = ({ ...rest }) => {
  return <Picklist {...rest} options={options} />
}

export default MetalLbModePicklist
