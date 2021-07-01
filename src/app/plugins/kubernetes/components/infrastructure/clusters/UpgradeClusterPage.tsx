// import React, { useEffect, useState } from 'react'
import React, { useCallback, useState } from 'react'
import useReactRouter from 'use-react-router'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import { routes } from 'core/utils/routes'
import FormWrapperDefault from 'core/components/FormWrapper'
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
import ClusterBatchUpgradeDialog from './ClusterBatchUpgradeDialog'
import DocumentMeta from 'core/components/DocumentMeta'
import SubmitButton from 'core/components/buttons/SubmitButton'
const FormWrapper: any = FormWrapperDefault // types on forward ref .js file dont work well.

const useStyles = makeStyles<Theme>((theme) => ({
  validatedFormContainer: {
    display: 'grid',
    gridGap: theme.spacing(2),
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
  cluster.selectedUpgradeVersion =
    defaultState === 'minor' ? cluster.minorUpgradeRoleVersion : cluster.patchUpgradeRoleVersion

  cluster.upgradeType = defaultState
  const [upgradeType, setUpgradeType] = useState(defaultState)
  const [showModal, setModal] = useState(false)

  const handleOpen = () => setModal(true)
  const handleClose = () => setModal(false)

  const onComplete = () => {
    history.push(routes.cluster.list.path())
    handleClose()
  }

  // @ts-ignore
  const [upgradeClusterNodes, upgradingClusterNodes] = useDataUpdater(
    (clusterActions as any).upgradeClusterNodes,
    onComplete,
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
        upgradeClusterNodes(wizardContext)
        onComplete()
      }

      if (wizardContext.sequentialClusterUpgrade) {
        upgradeClusterNodes(wizardContext)
        onComplete()
      }

      if (wizardContext.advancedBatchUpgrade) {
        handleOpen()
      }
    },
    [upgradeType],
  )

  const handleChange = useCallback((event, setWizardContext) => {
    const upgradeChoice = event.target.value
    setUpgradeType(upgradeChoice)
    const selectedUpgradeVersion =
      upgradeChoice === 'minor' ? cluster.minorUpgradeRoleVersion : cluster.patchUpgradeRoleVersion
    setWizardContext({ selectedUpgradeVersion })
  }, [])

  const confirmBatchUpgrade = useCallback((wizardContext) => {
    upgradeClusterNodes(wizardContext)
    onComplete()
  }, [])

  return (
    <>
      <DocumentMeta title="Add Cloud Provider" bodyClasses={['form-view']} />
      <FormWrapper title={`Upgrading Cluster ${cluster.name}`} backUrl={routes.cluster.list.path()}>
        <Wizard
          align="right"
          onComplete={handleSubmit}
          context={cluster}
          submitLabel="Upgrade Now"
          hideAllButtons
        >
          {({ wizardContext, setWizardContext, onNext, handleNext }) => {
            return (
              <>
                <WizardMeta
                  fields={wizardContext}
                  icon={<CloudProviderCard active type={cluster.cloudProviderType} />}
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
                              onChange={(event) => handleChange(event, setWizardContext)}
                            >
                              {cluster.minorUpgradeRoleVersion && (
                                <FormControlLabel
                                  value={UpgradeTypes.Minor}
                                  control={<Radio color="primary" />}
                                  label={`Minor - ${cluster.minorUpgradeRoleVersion}`}
                                />
                              )}
                              {cluster.patchUpgradeRoleVersion && (
                                <FormControlLabel
                                  value={UpgradeTypes.Patch}
                                  control={<Radio color="primary" />}
                                  label={`Patch - ${cluster.patchUpgradeRoleVersion}`}
                                />
                              )}
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
                    </ValidatedForm>
                    {showModal && (
                      <ClusterBatchUpgradeDialog
                        wizardContext={wizardContext}
                        handleClose={handleClose}
                        confirmBatchUpgrade={confirmBatchUpgrade}
                        cluster={cluster}
                      />
                    )}
                    <SubmitButton onClick={() => handleSubmit(wizardContext)}>
                      Upgrade Now
                    </SubmitButton>
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
