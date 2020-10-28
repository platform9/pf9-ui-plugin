import React, { useCallback } from 'react'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import ClusterNameField from '../../form-components/name'
import { CloudProviders } from 'k8s/components/infrastructure/cloudProviders/model'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { azurePrerequisitesLink } from 'k8s/links'
import Text from 'core/elements/text'
import ExternalLink from 'core/components/ExternalLink'
import {
  cloudProviderActions,
  loadCloudProviderDetails,
} from 'k8s/components/infrastructure/cloudProviders/actions'
import useDataLoader from 'core/hooks/useDataLoader'
import WizardStep from 'core/components/wizard/WizardStep'
import { makeStyles } from '@material-ui/core/styles'
import Theme from 'core/themes/model'
import FormReviewTable from 'core/components/validatedForm/review-table'
import { capitalizeString, castBoolToStr } from 'utils/misc'
import { defaultEtcBackupPath } from 'app/constants'
import CloudProviderField from '../../form-components/cloud-provider'
import CloudProviderRegionField from '../../form-components/cloud-provider-region'
import SshKeyTextField from '../../form-components/ssh-key-textfield'
import { PromptToAddProvider } from 'k8s/components/infrastructure/cloudProviders/PromptToAddProvider'
import { routes } from 'core/utils/routes'

export const templateTitle = 'One Click'

export const initialContext = {
  numMasters: 1,
  numWorkers: 0,
  allowWorkloadsOnMaster: true,
  masterSku: 'Standard_A1_v2',
  workerSku: 'Standard_A1_v2',
  ami: 'ubuntu',
  networkPlugin: 'flannel',
  etcdBackup: true,
  etcdStoragePath: defaultEtcBackupPath,
  etcdBackupInterval: 60 * 24,
  prometheusMonitoringEnabled: true,
}

const columns = [
  { id: 'numMasters', label: 'Master nodes' },
  { id: 'numWorkers', label: 'Worker nodes' },
  {
    id: 'allowWorkloadsOnMaster',
    label: 'Enable workloads on all master nodes',
    render: (value) => castBoolToStr()(value),
  },
  { id: 'masterSku', label: 'Master Node SKU' },
  { id: 'workerSku', label: 'Worker Node SKU' },
  { id: 'ami', label: 'Operating System', insertDivider: true },
  {
    id: 'networkPlugin',
    label: 'CNI',
    render: (value) => capitalizeString(value),
  },
  {
    id: 'etcdBackup',
    label: 'ETCD Backup',
    render: (value) => castBoolToStr()(value),
    insertDivider: true,
  },
  { id: 'etcdStoragePath', label: 'Storage Path' },
  { id: 'etcdBackupInterval', label: 'Backup Interval (minutes)' },
  {
    id: 'prometheusMonitoringEnabled',
    label: 'Enable monitoring with prometheus',
    render: (value) => castBoolToStr()(value),
  },
]

const useStyles = makeStyles<Theme>((theme) => ({
  validatedFormContainer: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
}))

const OneClickAzureCluster = ({ wizardContext, setWizardContext, onNext }) => {
  const classes = useStyles()

  const [cloudProviders, loading] = useDataLoader(cloudProviderActions.list)
  const hasAzureProvider = !!cloudProviders.some(
    (provider) => provider.type === CloudProviders.Azure,
  )

  const [cloudProviderDetails] = useDataLoader(loadCloudProviderDetails, {
    cloudProviderId: wizardContext.cloudProviderId,
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
      setWizardContext({ cloudProviderRegionId: regionName })
    },
    [cloudProviderDetails],
  )

  return (
    <WizardStep stepId="one-click" onNext={onNext}>
      {loading ? null : hasAzureProvider ? (
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
            {/* Cluster Name */}
            <ClusterNameField />

            {/* Cloud Provider */}
            <CloudProviderField
              cloudProviderType={CloudProviders.Azure}
              setWizardContext={setWizardContext}
            />

            {/* Cloud Provider Region */}
            <CloudProviderRegionField
              id="location"
              cloudProviderType={CloudProviders.Azure}
              wizardContext={wizardContext}
              onChange={handleRegionChange}
            />

            {/* SSH Key */}
            <SshKeyTextField />
          </FormFieldCard>

          <FormFieldCard title="Default Settings for New Cluster">
            <FormReviewTable data={wizardContext} columns={columns} />
          </FormFieldCard>
        </ValidatedForm>
      ) : (
        <FormFieldCard title="Configure Your Cluster">
          <PromptToAddProvider
            type={CloudProviders.Aws}
            src={routes.cloudProviders.add.path({ type: CloudProviders.Aws })}
          />
        </FormFieldCard>
      )}
    </WizardStep>
  )
}

export default OneClickAzureCluster
