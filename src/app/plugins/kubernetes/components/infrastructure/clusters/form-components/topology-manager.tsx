import CheckboxField from 'core/components/validatedForm/CheckboxField'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import React, { useContext } from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'
import TextField from 'core/components/validatedForm/TextField'
import { WizardContext } from 'core/components/wizard/Wizard'
const TopologyManagerField = () => (
  <CheckboxField
    id="enableTopologyManager"
    label="Add Topology Manager support"
    info="add Topology Manager support "
  />
)
const cpuManagerOptions = [
  { label: 'none', value: 'none' },
  { label: 'static', value: 'static' },
]
const topologyManagerPolicyoptions = [
  { label: 'none', value: 'none' },
  { label: 'best-effort', value: 'best-effort' },
  { label: 'restricted', value: 'restricted' },
  { label: 'single-numa-node', value: 'single-numa-node' },
]

export const TopologyManagerAddonFields = (props) => {
  const {
    wizardContext,
    setWizardContext,
  }: { wizardContext: any; setWizardContext: any } = useContext(WizardContext) as any

  return (
    <FormFieldCard title=" Add Topology Manager Policy">
      <PicklistField
        id="TopologyManagerPolicy"
        label="TopologyManagerPolicy"
        options={topologyManagerPolicyoptions}
        onChange={(value) => {
          setWizardContext({ topologyManagerPolicy: value })
        }}
        required
      />
      {wizardContext.topologyManagerPolicy !== 'none' &&
        wizardContext.topologyManagerPolicy !== undefined && (
          <PicklistField
            id="CpuManagerPolicy"
            label="CpuManagerPolicy"
            options={cpuManagerOptions}
            onChange={(value) => {
              setWizardContext({ cpuManagerPolicy: value })
            }}
            required
          />
        )}

      <TextField
        value={wizardContext.reservedCPUsList}
        onChange={(value) => setWizardContext({ reservedCPUs: value })}
        id="ReservedCPUs"
        label="Reserved CPUs"
        info="Enter a comma separated list of CPUs to be reserved for the system,example:4-8,9-12"
      />
    </FormFieldCard>
  )
}

export default TopologyManagerField
