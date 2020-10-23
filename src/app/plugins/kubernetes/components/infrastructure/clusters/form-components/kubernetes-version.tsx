import React from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'
import PicklistDefault from 'core/components/Picklist'
const Picklist: any = PicklistDefault // types on forward ref .js file dont work well.

// const kubernetesVersionPicklist = () => {
//   const options = [{ label: 'v1.19', value: 'v1.19' }]
//   return <Picklist options={options} />
// }

const kubernetesVersionPicklist = ({ ...rest }) => {
  const options = [{ label: 'v1.19', value: 'v1.19' }]
  return <Picklist {...rest} options={options} />
}

const KubernetesVersionField = ({ wizardContext, setWizardContext }) => (
  <PicklistField
    DropdownComponent={kubernetesVersionPicklist}
    id="kubernetesVersion"
    label="Kubernetes Version"
    onChange={(value) => setWizardContext({ kubernetesVersion: value })}
    value={wizardContext.kubernetesVersion}
    required
  />
)

export default KubernetesVersionField
