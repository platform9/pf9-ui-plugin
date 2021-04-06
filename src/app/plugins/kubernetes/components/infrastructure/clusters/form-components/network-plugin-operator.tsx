import React from 'react'
import CheckboxField from 'core/components/validatedForm/CheckboxField'

const NetworkPluginOperator = ({ wizardContext, setWizardContext }) => (
  <CheckboxField
    id="deployLuigiOperator"
    label="Network Plugin Operator"
    info="The network plugin operator will deploy Platform9 CRDs to enable multiple CNIs and features such as SR-IOV"
    onChange={(value) => setWizardContext({ deployLuigiOperator: value })}
    value={wizardContext.deployKubevirt ? true : !!wizardContext.deployLuigiOperator}
    disabled={wizardContext.deployKubevirt}
  />
)

export default NetworkPluginOperator
