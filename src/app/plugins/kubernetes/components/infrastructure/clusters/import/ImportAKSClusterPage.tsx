import React, { useCallback, useState } from 'react'
import FormWrapper from 'core/components/FormWrapper'
import Wizard from 'core/components/wizard/Wizard'
import useReactRouter from 'use-react-router'
import { routes } from 'core/utils/routes'
import WizardMeta from 'core/components/wizard/WizardMeta'
import CloudProviderCard from 'k8s/components/common/CloudProviderCard'
import { CloudProviders } from '../../cloudProviders/model'
import DocumentMeta from 'core/components/DocumentMeta'
import WizardStep from 'core/components/wizard/WizardStep'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import PicklistField from 'core/components/validatedForm/PicklistField'
import CloudProviderPicklist from 'k8s/components/common/CloudProviderPicklist'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import useDataLoader from 'core/hooks/useDataLoader'
import { cloudProviderActions } from '../../cloudProviders/actions'
import RegionsChecklist from './RegionsChecklist'
import ClustersChecklists from './ClustersChecklists'
import PresetField from 'core/components/PresetField'
import ReviewClustersTable from './ReviewClustersTable'
import { registerExternalClusters } from './actions'
import { importedClusterActions } from '../../importedClusters/actions'
import { trackEvent } from 'utils/tracking'
import { ClusterCloudPlatforms } from 'app/constants'

const toggleRegion = (region, wizardContext, setWizardContext) => {
  wizardContext.regions.includes(region)
    ? setWizardContext({ regions: wizardContext.regions.filter((r) => r !== region) })
    : setWizardContext({ regions: [...wizardContext.regions, region].sort() })
}

const useStyles = makeStyles<Theme>((theme) => ({
  validatedFormContainer: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
  regionsAndClusters: {
    display: 'flex',
  },
  regions: {
    minWidth: 200,
  },
  clusters: {
    flexGrow: 1,
  },
}))

const title = 'Import AKS Clusters'
const initialContext = {
  cloudProviderId: '',
  regions: [],
  selectedClusters: {},
  finalSelectedClusters: [],
}
const ImportAKSClusterPage = () => {
  const classes = useStyles()
  const { history } = useReactRouter()
  const [cloudProviders] = useDataLoader(cloudProviderActions.list)
  const [, , reloadImportedClusters] = useDataLoader(importedClusterActions.list)
  const providerType = CloudProviders.Azure
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (data) => {
    setSubmitting(true)
    trackEvent('Import AKS Clusters', {
      cloud_provider_id: data.cloudProviderId,
      regions: data.regions,
      clusters: data.finalSelectedClusters.map((cluster) => cluster.id),
    })
    await registerExternalClusters({
      cloudProviderId: data.cloudProviderId,
      clusters: data.finalSelectedClusters,
      stack: ClusterCloudPlatforms.AKS,
      detailsKey: 'resourceGroup',
    })
    setSubmitting(false)
    // do this here bc invalidateCache in the actions doesn't seem to work
    reloadImportedClusters(true)
    history.push(routes.cluster.imported.list.path())
  }

  const getCloudProviderName = useCallback(
    (id) => {
      return cloudProviders.find((cp) => cp.uuid === id)?.name
    },
    [cloudProviders],
  )

  return (
    <FormWrapper title={title} backUrl={routes.cluster.list.path()} loading={submitting}>
      <DocumentMeta title={title} bodyClasses={['form-view']} />
      <Wizard
        onComplete={handleSubmit}
        context={initialContext}
        originPath={routes.cluster.import.root.path()}
        submitLabel="Import"
      >
        {({ wizardContext, setWizardContext, onNext }) => (
          <WizardMeta
            fields={wizardContext}
            icon={<CloudProviderCard active type={providerType} />}
          >
            <WizardStep stepId="selectProvider" label="Select AKS Provider">
              <ValidatedForm
                classes={{ root: classes.validatedFormContainer }}
                initialValues={wizardContext}
                onSubmit={setWizardContext}
                triggerSubmit={onNext}
                elevated={false}
              >
                <FormFieldCard title="Select AKS Provider">
                  <PicklistField
                    DropdownComponent={CloudProviderPicklist}
                    id="cloudProviderId"
                    label="AKS Provider"
                    info="Find AKS clusters to import from the selected cloud provider."
                    type={CloudProviders.Azure}
                    onChange={(value) => setWizardContext({ cloudProviderId: value })}
                    value={wizardContext.cloudProviderId}
                    required
                  />
                </FormFieldCard>
              </ValidatedForm>
            </WizardStep>
            <WizardStep stepId="selectClusters" label="Select Regions & Clusters">
              <ValidatedForm
                classes={{ root: classes.validatedFormContainer }}
                initialValues={wizardContext}
                onSubmit={setWizardContext}
                triggerSubmit={onNext}
                elevated={false}
              >
                <FormFieldCard title="Select Regions">
                  <PresetField
                    label="AKS Provider:"
                    value={getCloudProviderName(wizardContext.cloudProviderId)}
                  />
                </FormFieldCard>
                <FormFieldCard title="Select Regions & Clusters">
                  <div className={classes.regionsAndClusters}>
                    <RegionsChecklist
                      cloudProviderId={wizardContext.cloudProviderId}
                      onChange={(value) => toggleRegion(value, wizardContext, setWizardContext)}
                      value={wizardContext.regions}
                      className={classes.regions}
                      clusters={wizardContext.clusterList}
                    />
                    <ClustersChecklists
                      cloudProviderId={wizardContext.cloudProviderId}
                      onChange={(value, region) =>
                        setWizardContext({
                          selectedClusters: { ...wizardContext.selectedClusters, [region]: value },
                        })
                      }
                      value={wizardContext.selectedClusters}
                      selectedRegions={wizardContext.regions}
                      className={classes.clusters}
                      stack={ClusterCloudPlatforms.AKS}
                      onClustersLoad={(clusters) => setWizardContext({ clusterList: clusters })}
                    />
                  </div>
                </FormFieldCard>
              </ValidatedForm>
            </WizardStep>
            <WizardStep stepId="confirm" label="Confirm">
              <ValidatedForm
                classes={{ root: classes.validatedFormContainer }}
                initialValues={wizardContext}
                onSubmit={setWizardContext}
                triggerSubmit={onNext}
                elevated={false}
              >
                <FormFieldCard title="Review & Confirm AKS Clusters to Import">
                  <PresetField
                    label="AKS Provider:"
                    value={getCloudProviderName(wizardContext.cloudProviderId)}
                  />
                  <ReviewClustersTable
                    selectedClusters={wizardContext.selectedClusters}
                    onChange={(value) => setWizardContext({ finalSelectedClusters: value })}
                    value={wizardContext.finalSelectedClusters}
                    required
                  />
                </FormFieldCard>
              </ValidatedForm>
            </WizardStep>
          </WizardMeta>
        )}
      </Wizard>
    </FormWrapper>
  )
}

export default ImportAKSClusterPage
