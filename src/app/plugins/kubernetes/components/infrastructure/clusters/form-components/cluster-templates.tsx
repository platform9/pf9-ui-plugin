import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'

const ClusterTemplatesField = ({ options, onChange }) => (
  <PicklistField id="template" label="Cluster Template" options={options} onChange={onChange} />
)

export default ClusterTemplatesField
