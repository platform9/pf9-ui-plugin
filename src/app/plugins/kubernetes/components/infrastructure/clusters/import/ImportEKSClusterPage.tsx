import React, { useCallback, useState } from 'react'
import FormWrapper from 'core/components/FormWrapper'
import Wizard from 'core/components/wizard/Wizard'
// import useDataUpdater from 'core/hooks/useDataUpdater'
import useReactRouter from 'use-react-router'
// import { clusterActions } from '../actions'
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

const toggleRegion = (region, wizardContext, setWizardContext) => {
  wizardContext.regions.includes(region)
    ? setWizardContext({ regions: wizardContext.regions.filter((r) => r !== region) })
    : setWizardContext({ regions: [...wizardContext.regions, region] })
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
    width: 200,
  },
  clusters: {
    flexGrow: 1,
  },
}))

const title = 'Import EKS Clusters'
const initialContext = {
  cloudProviderId: '',
  regions: [],
  selectedClusters: {},
  finalSelectedClusters: [],
}
const ImportEKSClusterPage = () => {
  const classes = useStyles()
  const { history } = useReactRouter()
  const [cloudProviders] = useDataLoader(cloudProviderActions.list)
  const providerType = CloudProviders.Aws
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (data) => {
    setSubmitting(true)
    await registerExternalClusters({
      cloudProviderId: data.cloudProviderId,
      clusters: data.finalSelectedClusters,
    })
    setSubmitting(false)
    history.push(routes.cluster.list.path())
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
        originPath={routes.cluster.import.path()}
        submitLabel="Import"
      >
        {({ wizardContext, setWizardContext, onNext }) => (
          <WizardMeta
            fields={wizardContext}
            icon={<CloudProviderCard active type={providerType} />}
          >
            <WizardStep stepId="selectProvider" label="Select AWS Provider">
              <ValidatedForm
                classes={{ root: classes.validatedFormContainer }}
                initialValues={wizardContext}
                onSubmit={setWizardContext}
                triggerSubmit={onNext}
                elevated={false}
              >
                <FormFieldCard title="Select AWS Provider">
                  <PicklistField
                    DropdownComponent={CloudProviderPicklist}
                    id="cloudProviderId"
                    label="AWS Provider"
                    info="Find EKS clusters to import from the selected cloud provider."
                    type={CloudProviders.Aws}
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
                    label="AWS Provider:"
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
                <FormFieldCard title="Review & Confirm EKS Clusters to Import">
                  <PresetField
                    label="AWS Provider:"
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

export default ImportEKSClusterPage
