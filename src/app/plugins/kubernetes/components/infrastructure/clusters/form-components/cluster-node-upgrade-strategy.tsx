import React from 'react'
import TextField from 'core/components/validatedForm/TextField'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { IconInfo } from 'core/components/validatedForm/Info'
import RadioFields from 'core/components/validatedForm/radio-fields'

const sequentialStrategyOptions = [
  {
    label: 'Sequential',
    value: 'sequential',
    info: `Sequential: Each Worker node will be upgraded 1 by 1, sequentially.`,
  },
]

function handleSetUpgradeStrategy(field) {
  return {
    sequentialStrategy: field === 'sequentialStrategy' ? true : false,
    percentageStrategy: field === 'percentageStrategy' ? true : false,
    listStrategy: field === 'listStrategy' ? true : false,
  }
}

export const SequentialUpgradeField = ({ wizardContext, setWizardContext }) => {
  return (
    <RadioFields
      value={wizardContext['sequentialStrategy']}
      options={sequentialStrategyOptions}
      id="sequentialStrategy"
      onChange={() => setWizardContext(handleSetUpgradeStrategy('sequentialStrategy'))}
    />
  )
}

export const PercentageUpgradeField = ({ wizardContext, setWizardContext }) => {
  return (
    <FormFieldCard title="Percentage Upgrade Strategy">
      <RadioFields
        id="percentageStrategy"
        value={wizardContext['percentageStrategy']}
        options={sequentialStrategyOptions}
        onChange={() => setWizardContext(handleSetUpgradeStrategy('percentageStrategy'))}
      />
    </FormFieldCard>
  )
}

export const AdvancedBatchUpgradeFeild = ({ wizardContext, setWizardContext }) => {
  return (
    <RadioFields
      value={wizardContext['advancedBatchUpgrade']}
      options={sequentialStrategyOptions}
      id="advancedBatchUpgrade"
      onChange={() => setWizardContext(handleSetUpgradeStrategy('advancedBatchUpgrade'))}
    />
  )
}

export const PercentageAddonFields = () => (
  <FormFieldCard title="ETCD Backup Configuration">
    <IconInfo
      icon="info-circle"
      title="ETCD Backup will backup your ETCD database at a set interval to the location provided."
      spacer={false}
    />
    <TextField
      id="batchUpgradePercentage"
      label="Percentage of Worker nodes to be upgraded in parrallel"
      info="This is the disk path where the etcd backup data will be stored on each master node of this cluster"
      required
    />
  </FormFieldCard>
)
export const AdvancedBatchUpgradeAddonFields = () => (
  <FormFieldCard title="ETCD Backup Configuration">
    <IconInfo
      icon="info-circle"
      title="ETCD Backup will backup your ETCD database at a set interval to the location provided."
      spacer={false}
    />
    <TextField
      id="etcdStoragePath"
      label="Storage Path"
      info="This is the disk path where the etcd backup data will be stored on each master node of this cluster"
      required
    />
  </FormFieldCard>
)
