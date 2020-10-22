import React, { useCallback } from 'react'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import ClusterNameField from '../../form-components/name'
import { CloudProviders } from 'k8s/components/infrastructure/cloudProviders/model'
import { customValidator } from 'core/utils/fieldValidators'
import { isKeyValid } from 'ssh-pub-key-validation'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { azurePrerequisitesLink } from 'k8s/links'
import Text from 'core/elements/text'
import ExternalLink from 'core/components/ExternalLink'
import { loadCloudProviderDetails } from 'k8s/components/infrastructure/cloudProviders/actions'
import useDataLoader from 'core/hooks/useDataLoader'
import WizardStep from 'core/components/wizard/WizardStep'
import { makeStyles } from '@material-ui/core/styles'
import Theme from 'core/themes/model'
import FormReviewTable from 'core/components/validatedForm/review-table'
import { castBoolToStr } from 'utils/misc'
import { defaultEtcBackupPath } from 'app/constants'
import CloudProviderField from '../../form-components/cloud-provider'
import CloudProviderRegionField from '../../form-components/cloud-provider-region'
import SshKeyTextField from '../../form-components/ssh-key-textfield'

export const templateTitle = 'One Click'

export const initialContext = {
  numMasters: 1,
  numWorkers: 0,
  allowWorkloadsOnMaster: true,
  masterFlavor: 'Standard_A1_v2',
  workerFlavor: 'Standard_A1_v2',
  vpc: 'ubuntu',
  networkPlugin: 'flannel', // what is the label for this? can't find this field on azure form
  etcdStoragePath: defaultEtcBackupPath,
  etcdBackupInterval: 60 * 24,
  prometheusMonitoringEnabled: true,
}

const columns = [
  { id: 'numMasters', label: 'Master nodes' },
  { id: 'numWorkers', label: 'Worker nodes' },
  { id: 'allowWorkloadsOnMaster', label: 'Enable workloads on all master nodes' },
  { id: 'masterSku', label: 'Master Node SKU' },
  { id: 'workerSku', label: 'Worker Node SKU' },
  { id: 'vpc', label: 'VPC' },
  {
    id: 'etcdBackup',
    label: 'ETCD Backup',
    render: (value) => castBoolToStr()(value),
  },
  { id: 'etcdStoragePath', label: 'Storage Path' },
  { id: 'etcdBackupInterval', label: 'Backup Interval (minutes)' },
  { id: 'prometheusMonitoringEnabled', label: 'Enable monitoring with prometheus' },
]

const sshKeyValidator = customValidator((value) => {
  return isKeyValid(value)
}, 'You must enter a valid SSH key')

const OneClickAzureCluster = ({
  wizardContext,
  setWizardContext,
  params,
  updateParams,
  getParamsUpdater,
  onNext,
}) => {
  const classes = useStyles()
  const [cloudProviderDetails] = useDataLoader(loadCloudProviderDetails, {
    cloudProviderId: params.cloudProviderId,
  })

  const mapRegionName = useCallback(
    (displayName) => {
      return cloudProviderDetails.find((x) => x.DisplayName === displayName).RegionName
    },
    [cloudProviderDetails],
  )

  const handleRegionChange = useCallback(
    (displayName) => {
      const regionName = mapRegionName(displayName)
      updateParams({ cloudProviderRegionId: regionName })
    },
    [cloudProviderDetails],
  )

  return (
    <WizardStep stepId="one-click" onNext={onNext}>
      <ValidatedForm
        classes={{ root: classes.validatedFormContainer }}
        fullWidth
        initialValues={wizardContext}
        onSubmit={setWizardContext}
        triggerSubmit={onNext}
        elevated={false}
      >
        <FormFieldCard
          title="Cluster Configuration"
          link={
            <ExternalLink url={azurePrerequisitesLink}>
              <Text variant="caption2">Azure Cluster Help</Text>
            </ExternalLink>
          }
        >
          <ClusterNameField setWizardContext={setWizardContext} />

          <CloudProviderField
            cloudProviderType={CloudProviders.Azure}
            onChange={getParamsUpdater('cloudProviderId')}
          />

          <CloudProviderRegionField
            id="location"
            providerType={CloudProviders.Azure}
            cloudProviderId={params.cloudProviderId}
            onChange={handleRegionChange}
          />

          <SshKeyTextField validations={[sshKeyValidator]} />
        </FormFieldCard>

        <FormFieldCard title="Default Settings for New Cluster">
          <FormReviewTable data={wizardContext} columns={columns} />
        </FormFieldCard>
      </ValidatedForm>
    </WizardStep>
  )
}

export default OneClickAzureCluster

const useStyles = makeStyles<Theme>((theme) => ({
  validatedFormContainer: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
}))
