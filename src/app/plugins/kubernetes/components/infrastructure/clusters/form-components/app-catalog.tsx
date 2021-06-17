import React from 'react'
import CheckboxField from 'core/components/validatedForm/CheckboxField'

export default () => (
  <CheckboxField
    id="appCatalogEnabled"
    label="Enable Application Catalog"
    info="Enable the Helm Application Catalog on this cluster"
  />
)
