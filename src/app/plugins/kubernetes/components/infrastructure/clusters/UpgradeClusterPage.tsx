// import React, { useEffect, useState } from 'react'
import React, { useCallback, useState } from 'react'
import useReactRouter from 'use-react-router'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import { routes } from 'core/utils/routes'
import FormWrapperDefault from 'core/components/FormWrapper'
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
const FormWrapper: any = FormWrapperDefault // types on forward ref .js file dont work well.

const useStyles = makeStyles<Theme>((theme) => ({
  validatedFormContainer: {
    display: 'grid',
    gridGap: theme.spacing(2),
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
const initialContext = {
  sequentialClusterUpgrade: false,
  percentageClusterUpgrade: false,
  advancedBatchUpgrade: false,
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
  }
}

const UpgradeClusterPage = () => {
  const [clusters] = useDataLoader(clusterActions.list)
  const { match, history } = useReactRouter()
  const cluster = clusters.find((x) => x.uuid === match.params.id)
  console.log('cluster', cluster)
  const defaultState = getUpgradeTarget(cluster)
  const [upgradeType, setUpgradeType] = useState(defaultState)
  const classes = useStyles({})
  const submitLastStep = (params) => {
    history.push(routes.cluster.list.path())
  }

  // @ts-ignore
  const [upgradeCluster, upgradingCluster] = useDataUpdater(
    (clusterActions as any).upgradeCluster,
    submitLastStep,
  )
  const handleSubmit = useCallback(() => upgradeCluster({ cluster, upgradeType }), [
    upgradeCluster,
    upgradeType,
  ])

  const networkStackOptions = [
    {
      label: 'Sequential',
      value: 'sequential',
      info: `Sequential: Each Worker node will be upgraded 1 by 1, sequentially.`,
    },
    {
      label: 'Percentage',
      value: 'percentage',
      info: `Percentage: The specified percent of Worker node will be upgraded in parallel. 10% would upgrade 10 nodes of 100 node cluster
       in parallel, then the next 10.`,
    },
    {
      label: 'List',
      value: 'list',
      info: `List: The specified worker nodes will be upgraded in parallel.`,
    },
  ]

  const handleChange = useCallback(
    (event, upgradeChoice) => {
      setUpgradeType(upgradeChoice)
    },
    [upgradeType],
  )

  const wizardMetaFormattedNames = {
    name: 'Cluster',
    version: 'Version',
    masterNodes: 'Master Nodes',
    workerNodes: 'Worker Nodes',
    networkPlugin: 'CNI',
  }

  const wizardMetaCalloutFields = ['name', 'version', 'masterNodes', 'workerNodes', 'networkPlugin']

  return (
    <>
      <DocumentMeta title="Add Cloud Provider" bodyClasses={['form-view']} />
      <FormWrapper title={`Upgrading Cluster ${cluster.name}`} backUrl={routes.cluster.list.path()}>
        <Wizard
          align="right"
          onComplete={handleSubmit}
          context={cluster}
          hideBack={true}
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
                          <FormFieldCard title="Upgrade Strategy">
                            <AddonTogglers
                              addons={clusterAddons}
                              wizardContext={wizardContext}
                              setWizardContext={setWizardContext}
                            />
                          </FormFieldCard>
                          {/* <FormFieldCard title="Upgrade Strategy">
                            <Text className={classes.text} variant="body2">
                              During an upgrade Platform9 will upgrade the Master Nodes then
                              progress to upgrading each Worker node. Worker nodes can be upgraded
                              using one of three strategies: sequential, percentage or list.
                            </Text>
                            <RadioFields
                              id={formKey}
                              value={wizardContext[formKey]}
                              options={networkStackOptions}
                              onChange={
                                (changeValue) => {
                                  setWizardContext(
                                    handleUpgradeSelection(changeValue, wizardContext),
                                  )
                                  console.log(changeValue)
                                }
                                //handleNetworkStackChange(changeValue, wizardContext),
                              }
                            />
                          </FormFieldCard> */}
                          {/* {wizardContext.upgradeClusterType &&
                            wizardContext.upgradeClusterType === 'percentage' && (
                              <FormFieldCard title="Percentage Upgrade Strategy">
                                <Text className={classes.text} variant="body2">
                                  Specify the percentage of nodes to upgrade in parallel.
                                </Text>
                                <RadioFields
                                  id={formKey}
                                  value={wizardContext[formKey]}
                                  options={networkStackOptions}
                                  onChange={
                                    (changeValue) => {
                                      setWizardContext(
                                        handleUpgradeSelection(changeValue, wizardContext),
                                      )
                                      console.log(changeValue)
                                    }
                                    //handleNetworkStackChange(changeValue, wizardContext),
                                  }
                                />
                              </FormFieldCard>
                            )} */}
                        </>
                      )}
                    </ValidatedForm>
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
