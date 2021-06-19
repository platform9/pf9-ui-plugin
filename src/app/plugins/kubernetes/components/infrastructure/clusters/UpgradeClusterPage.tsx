// import React, { useEffect, useState } from 'react'
import React, { useCallback, useState } from 'react'
import useReactRouter from 'use-react-router'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import { routes } from 'core/utils/routes'
import FormWrapperDefault from 'core/components/FormWrapper'
import { Button, Dialog, DialogActions, List, ListItem } from '@material-ui/core'
import DocumentMeta from 'core/components/DocumentMeta'
import { CloudProviders } from '../cloudProviders/model'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import CloudProviderCard from 'k8s/components/common/CloudProviderCard'
import WizardMeta from 'core/components/wizard/WizardMeta'
import useDataLoader from 'core/hooks/useDataLoader'
import { clusterActions } from './actions'
import { FormControlLabel, makeStyles, Radio, RadioGroup } from '@material-ui/core'
import Theme from 'core/themes/model'
import { AddonTogglers } from './form-components/cluster-addon-manager'
import useDataUpdater from 'core/hooks/useDataUpdater'
import Text from 'core/elements/text'
const FormWrapper: any = FormWrapperDefault // types on forward ref .js file dont work well.

const useStyles = makeStyles<Theme>((theme) => ({
  validatedFormContainer: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
  dialogContainer: {
    padding: theme.spacing(1, 3),
  },
  dialogHeader: {
    padding: theme.spacing(1, 0),
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
    fontWeight: 600,
  },
  selectedNodesText: {
    marginTop: theme.spacing(2),
  },
  nodeList: {
    margin: theme.spacing(1),
    width: '50%',
    height: '200px',
    overflow: 'auto',
  },
  nodeNameTitle: {
    padding: theme.spacing(0.5),
    borderBottom: `1px solid ${theme.palette.grey[900]}`,
  },
  listNodes: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
  },
  dialogActions: {
    marginTop: theme.spacing(10),
  },
  text: {
    marginTop: theme.spacing(0.5),
    marginLeft: theme.spacing(3),
  },
}))

enum UpgradeTypes {
  Minor = 'minor',
  Patch = 'patch',
}

function getUpgradeTarget(cluster) {
  if (cluster.canMinorUpgrade) {
    return UpgradeTypes.Minor
  }
  return UpgradeTypes.Patch
}

const clusterAddons = [
  'sequentialClusterUpgrade',
  'percentageClusterUpgrade',
  'advancedBatchUpgrade',
]

const togglersMapping = {
  sequentialClusterUpgrade: false,
  percentageClusterUpgrade: false,
  advancedBatchUpgrade: false,
}

export const handleSetUpgradeStrategy = (field: any, id: any) => {
  return {
    ...togglersMapping,
    [id]: field,
    field,
  }
}

const UpgradeClusterPage = () => {
  const [clusters] = useDataLoader(clusterActions.list)
  const { match, history } = useReactRouter()
  const classes = useStyles({})
  const cluster = clusters.find((x) => x.uuid === match.params.id)
  const defaultState = getUpgradeTarget(cluster)
  const [upgradeType, setUpgradeType] = useState(defaultState)
  const [showModal, setModal] = useState(false)

  const handleOpen = () => setModal(true)
  const handleClose = () => setModal(false)

  const submitLastStep = (params) => {
    history.push(routes.cluster.list.path())
  }

  // @ts-ignore
  const [upgradeCluster, upgradingCluster] = useDataUpdater(
    (clusterActions as any).upgradeCluster,
    submitLastStep,
  )

  // @ts-ignore
  const [upgradeClusterOnPercentage, upgradingClusterOnPercentage] = useDataUpdater(
    (clusterActions as any).upgradeClusterOnPercentage,
    submitLastStep,
  )

  // @ts-ignore
  const [upgradeClusterInBatches, upgradingClusterInBatches] = useDataUpdater(
    (clusterActions as any).upgradeClusterInBatches,
    submitLastStep,
  )

  const wizardMetaFormattedNames = {
    name: 'Cluster',
    version: 'Version',
    masterNodes: 'Master Nodes',
    workerNodes: 'Worker Nodes',
    networkPlugin: 'CNI',
  }

  const wizardMetaCalloutFields = ['name', 'version', 'masterNodes', 'workerNodes', 'networkPlugin']

  const handleSubmit = useCallback(
    (wizardContext) => {
      if (wizardContext.percentageClusterUpgrade) {
        const batchUpgradePercent = wizardContext.batchUpgradePercent
        upgradeClusterOnPercentage({ cluster, upgradeType, batchUpgradePercent })
      }

      if (wizardContext.sequentialClusterUpgrade) {
        upgradeCluster({ cluster, upgradeType })
      }

      if (wizardContext.advancedBatchUpgrade) {
        handleOpen()
      }
    },
    [upgradeClusterOnPercentage, upgradeType],
  )

  const handleChange = useCallback(
    (event, upgradeChoice) => {
      setUpgradeType(upgradeChoice)
    },
    [upgradeType],
  )

  const confirmBatchUpgrade = useCallback(() => {
    // const batchUpgradeNodes = wizardContext.batchUpgradeNodes
    // upgradeClusterInBatches({ cluster, upgradeType, batchUpgradeNodes })
  }, [upgradeClusterInBatches])

  const renderModalConfirmationDialog = (wizardContext) => {
    return (
      <Dialog open fullWidth maxWidth="md" onClose={handleClose}>
        <div className={classes.dialogContainer}>
          <Text variant="body1" className={classes.dialogHeader}>
            Warning: Partial Cluster Upgrade
          </Text>
          <div className={classes.dialogContent}>
            <Text variant="body2">
              The selected nodes will be upgraded in parallel, any worker nodes that are not
              included in this batch will need to be upgraded once the batch upgrade is complete.
            </Text>
            <Text variant="body2" className={classes.selectedNodesText}>
              Selected Nodes
            </Text>
            <div className={classes.nodeList}>
              <List>
                <Text variant="body2" className={classes.nodeNameTitle}>
                  Node Name
                </Text>
                {wizardContext.batchUpgradeNodes &&
                  wizardContext.batchUpgradeNodes.map((node) => (
                    <ListItem key={node.uuid} className={classes.listNodes}>
                      {node.name}
                    </ListItem>
                  ))}
              </List>
            </div>
            <Text variant="body2" className={classes.selectedNodesText}>
              Nodes Excluded from Upgrade: 25
            </Text>
            <Text variant="body2" className={classes.selectedNodesText}>
              Nodes Already Upgraded: 10
            </Text>
          </div>
          <DialogActions className={classes.dialogActions}>
            <Button variant="contained" color="secondary" onClick={confirmBatchUpgrade}>
              Continue With Upgrade
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    )
  }

  return (
    <>
      <DocumentMeta title="Add Cloud Provider" bodyClasses={['form-view']} />
      <FormWrapper title={`Upgrading Cluster ${cluster.name}`} backUrl={routes.cluster.list.path()}>
        <Wizard
          align="right"
          onComplete={handleSubmit}
          context={cluster}
          hideBack
          submitLabel="Upgrade Now"
        >
          {({ wizardContext, setWizardContext, onNext, handleNext }) => {
            return (
              <>
                <WizardMeta
                  fields={wizardContext}
                  icon={<CloudProviderCard active type={CloudProviders.Aws} />}
                  keyOverrides={wizardMetaFormattedNames}
                  calloutFields={wizardMetaCalloutFields}
                >
                  <WizardStep
                    stepId="step1"
                    label="Add Cloud Provider Credentials"
                    keepContentMounted={false}
                  >
                    <ValidatedForm
                      classes={{ root: classes.validatedFormContainer }}
                      fullWidth
                      initialValues={wizardContext}
                      onSubmit={setWizardContext}
                      triggerSubmit={onNext}
                      elevated={false}
                      withAddonManager
                    >
                      {({ setFieldValue, values }) => (
                        <>
                          {cluster.upgradingTo ? (
                            <FormFieldCard title="Batch Upgrade in progress">
                              <Text className={classes.text} variant={'body2'}>
                                cluster upgrade in progress. The selected worker nodes will be
                                upgraded to: {cluster.upgradingTo}
                              </Text>
                            </FormFieldCard>
                          ) : (
                            <FormFieldCard title="Select the version to Upgrade the Cluster">
                              <RadioGroup
                                name="Upgrade Type"
                                value={upgradeType}
                                onChange={handleChange}
                              >
                                <FormControlLabel
                                  value={UpgradeTypes.Minor}
                                  control={<Radio color="primary" />}
                                  label={`Minor - ${cluster.minorUpgradeRoleVersion}`}
                                />
                                <FormControlLabel
                                  value={UpgradeTypes.Patch}
                                  control={<Radio color="primary" />}
                                  label={`Patch - ${cluster.patchUpgradeRoleVersion}`}
                                />
                              </RadioGroup>
                            </FormFieldCard>
                          )}
                          <FormFieldCard title="Upgrade Strategy">
                            <AddonTogglers
                              addons={clusterAddons}
                              wizardContext={wizardContext}
                              setWizardContext={setWizardContext}
                            />
                          </FormFieldCard>
                        </>
                      )}
                    </ValidatedForm>
                    {showModal && renderModalConfirmationDialog(wizardContext)}
                  </WizardStep>
                </WizardMeta>
              </>
            )
          }}
        </Wizard>
      </FormWrapper>
    </>
  )
}

export default UpgradeClusterPage
