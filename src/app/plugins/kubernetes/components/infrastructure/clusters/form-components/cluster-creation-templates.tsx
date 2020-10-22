import PicklistField from 'core/components/validatedForm/PicklistField'
import React from 'react'

const ClusterCreationTemplatesField = ({ templateOptions, handleTemplateChoice }) => (
  <PicklistField
    id="template"
    label="Cluster Template"
    options={templateOptions}
    onChange={handleTemplateChoice}
  />
)

export default ClusterCreationTemplatesField
