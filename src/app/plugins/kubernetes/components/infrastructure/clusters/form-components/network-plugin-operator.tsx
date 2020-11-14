import React from 'react'
import CheckboxField from 'core/components/validatedForm/CheckboxField'

const NetworkPluginOperator = () => (
  <CheckboxField
    id="deployLuigiOperator"
    label="Network Plugin Operator"
    info="The netowrk plugin operator will deploy Platform9 CRDs to enable multiple CNIs and features such as SR-IOV"
  />
)

export default NetworkPluginOperator
