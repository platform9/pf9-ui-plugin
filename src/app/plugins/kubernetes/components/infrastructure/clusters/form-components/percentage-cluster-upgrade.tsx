import React, { useContext } from 'react'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { handleSetUpgradeStrategy } from '../../clusters/UpgradeClusterPage'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import TextField from 'core/components/validatedForm/TextField'
import Text from 'core/elements/text'
import { IconInfo } from 'core/components/validatedForm/Info'
import { WizardContext } from 'core/components/wizard/Wizard'
import { InputAdornment } from '@material-ui/core'

const PercentageClusterUpgradeField = ({ wizardContext, setWizardContext }) => (
  <CheckboxField
    id="percentageClusterUpgrade"
    label="Percentage"
    disabled={wizardContext.upgradingTo}
    infoPlacement="right-end"
    onChange={(value) =>
      setWizardContext(handleSetUpgradeStrategy(value, 'percentageClusterUpgrade'))
    }
    value={wizardContext?.percentageClusterUpgrade}
    info="Percentage: The specified percent of Worker node will be upgraded in parallel. 10% would upgrade 10 nodes of 100 node cluster
       in parallel, then the next 10."
  />
)

export const PercentageClusterUpgradeAddonField = ({ values }) => {
  const {
    wizardContext,
    setWizardContext,
  }: { wizardContext: any; setWizardContext: any } = useContext(WizardContext) as any

  return (
    <FormFieldCard title="Percentage Configuration">
      <IconInfo
        icon="info-circle"
        title="Specify the percentage of nodes to upgrade in parallel."
        spacer={false}
      >
        <Text variant="body2">
          <b>Cluster:</b>
          {values?.name}
        </Text>
        <Text variant="body2">
          <b>Total Worker Nodes:</b>
          {values?.workerNodes?.length}
        </Text>
      </IconInfo>
      <TextField
        id="percentage"
        label="Worker nodes to upgrade in parallel"
        type="number"
        value={wizardContext.batchUpgradePercent}
        onChange={(value) => setWizardContext({ batchUpgradePercent: value })}
        InputProps={{
          inputProps: { min: 0, max: 100 },
          startAdornment: <InputAdornment position="start">%</InputAdornment>,
        }}
        required
      />
    </FormFieldCard>
  )
}

export default PercentageClusterUpgradeField
