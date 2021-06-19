import React, { useContext } from 'react'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { handleSetUpgradeStrategy } from '../UpgradeClusterPage'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import { IconInfo } from 'core/components/validatedForm/Info'
import Text from 'core/elements/text'
import TransferList from 'core/elements/transfer-list'
import { makeStyles } from '@material-ui/core/styles'
import { WizardContext } from 'core/components/wizard/Wizard'

const useStyles = makeStyles((theme) => ({
  text: {
    marginBottom: theme.spacing(1),
  },
}))

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
        info="Advanced Batch Upgrade: The specified worked nodes will be upgraded in parallel. Worker nodes can be manually upgraded in distinct batches."
      />
    </>
  )
}

export const AdvancedBatchUpgradeAddonField = ({ values }) => {
  const {
    wizardContext,
    setWizardContext,
  }: { wizardContext: any; setWizardContext: any } = useContext(WizardContext) as any

  const classes = useStyles()

  // const isUpgraded = (node) => {
  //   if (values.upgradingTo === null) return true
  //   else if (node.actualKubeRoleVersion === values.upgradingTo) {
  //     return true
  //   } else {
  //     return false
  //   }
  // }

  // const [workerNodes, upgradedNodes] = partition(isUpgraded, values.workerNodes)
  return (
    <FormFieldCard title="Batch Upgrade Strategy">
      <IconInfo
        icon="info-circle"
        title="Select the nodes to upgrade in parallel, any remaining nodes will not be upgraded and must be
        upgraded in additional batches."
        spacer={false}
      >
        <Text className={classes.text} variant="body2">
          <b>Total Worker Nodes :</b>
          {values?.workerNodes?.length}
        </Text>
        <Text className={classes.text} variant="body2">
          <b>Upgraded Worker Nodes :</b>
          {values?.workerNodes?.length}
        </Text>

        <Text className={classes.text} variant="body2">
          <b>Nodes Excluded from Batch :</b>
          {values?.workerNodes?.length}
        </Text>
      </IconInfo>
      <Text>Select the nodes to include in this batch</Text>
      <TransferList
        clusterNodes={values.nodes}
        setWizardContext={setWizardContext}
        wizardContext={wizardContext}
      />
    </FormFieldCard>
  )
}

export default AdvancedBatchUpgradeField
