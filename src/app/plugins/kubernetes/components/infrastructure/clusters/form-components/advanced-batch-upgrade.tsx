import React from 'react'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { handleSetUpgradeStrategy } from '../UpgradeClusterPage'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import { IconInfo } from 'core/components/validatedForm/Info'
import Text from 'core/elements/text'
import TransferList from 'core/elements/transfer-list'

const AdvancedBatchUpgradeField = ({ wizardContext, setWizardContext }) => {
  return (
    <>
      <CheckboxField
        id="advancedBatchUpgrade"
        label="Advanced: Batch Upgrade"
        infoPlacement="right-end"
        onChange={(value) =>
          setWizardContext(handleSetUpgradeStrategy(value, 'advancedBatchUpgrade'))
        }
        value={wizardContext?.advancedBatchUpgrade}
        info="Sequential: Each Worker node will be upgraded 1 by 1, sequentially."
      />
    </>
  )
}

export const AdvancedBatchUpgradeAddonField = ({ values }) => (
  <FormFieldCard title="Advanced: Batch Upgrade Configuration">
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
    <TransferList clusterNodes={values.nodes} />
  </FormFieldCard>
)

export default AdvancedBatchUpgradeField
