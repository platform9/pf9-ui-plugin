import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'

const options = [
  { label: '1', value: 1 },
  { label: '3', value: 3 },
  { label: '5', value: 5 },
]

const NumMasterNodesField = ({ numMasterOptions = options }) => (
  <PicklistField
    id="numMasters"
    options={numMasterOptions}
    label="Master nodes"
    info="Number of master nodes to deploy.  3 nodes are required for an High Availability (HA) cluster."
    required
  />
)

export default NumMasterNodesField
