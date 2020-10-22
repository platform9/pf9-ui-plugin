import React from 'react'
import ExternalLink from 'core/components/ExternalLink'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { routes } from 'core/utils/routes'
import { CloudProviders } from 'k8s/components/infrastructure/cloudProviders/model'
import { PromptToAddProvider } from 'k8s/components/infrastructure/cloudProviders/PromptToAddProvider'
import { awsPrerequisitesLink } from 'k8s/links'
import ClusterNameField from '../../form-components/name'
import AwsClusterSshKeyPickList from '../AwsClusterSshKeyPicklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { cloudProviderActions } from 'k8s/components/infrastructure/cloudProviders/actions'
import WizardStep from 'core/components/wizard/WizardStep'
import FormReviewTable from 'core/components/validatedForm/review-table'
import { castBoolToStr } from 'utils/misc'
import { defaultEtcBackupPath } from 'app/constants'
import { makeStyles } from '@material-ui/core/styles'
import Theme from 'core/themes/model'
import CloudProviderRegionField from '../../form-components/cloud-provider-region'
import CloudProviderField from '../../form-components/cloud-provider'
import SshKeyField from '../../form-components/ssh-key-picklist'
import ClusterDomainField from '../../form-components/cluster-domain'
import AwsAvailabilityZoneField from '../aws-availability-zone'

export const templateTitle = 'One Click'

export const initialContext = {
  network: 'newPublic',
  numMasters: 1,
  numWorkers: 1,
  allowWorkloadsOnMaster: true,
  masterFlavor: 't2.medium',
  workerFlavor: 't2.medium',
  ami: 'ubuntu',
  calicoIpIpMode: 'Always',
  calicoNatOutgoing: true,
  calicoV4BlockSize: '24',
  mtuSize: 1440,
  etcdStoragePath: defaultEtcBackupPath,
  etcdBackupInterval: 60 * 24,
  prometheusMonitoringEnabled: true,
}

const columns = [
  { id: 'network', label: 'Network' },
  { id: 'numMasters', label: 'Master nodes' },
  { id: 'numWorkers', label: 'Worker nodes' },
  { id: 'allowWorkloadsOnMaster', label: 'Enable workloads on all master nodes' },
  { id: 'masterSku', label: 'Master Node SKU' },
  { id: 'workerSku', label: 'Worker Node SKU' },
  { id: 'ami', label: 'Operating System' },
  { id: 'calicoIpIpMode', label: 'IP in IP Encapsulation Mode' },
  { id: 'calicoNatOutgoing', label: 'NAT Outgoing', render: (value) => castBoolToStr()(value) },
  { id: 'calicoV4BlockSize', label: 'Block Size' },
  { id: 'mtuSize', label: 'Block Size' },
  {
    id: 'etcdBackup',
    label: 'ETCD Backup',
    render: (value) => castBoolToStr()(value),
  },
  { id: 'etcdStoragePath', label: 'Storage Path' },
  { id: 'etcdBackupInterval', label: 'Backup Interval (minutes)' },
  { id: 'prometheusMonitoringEnabled', label: 'Enable monitoring with prometheus' },
]

const OneClickAwsCluster = ({
  wizardContext,
  setWizardContext,
  params,
  getParamsUpdater,
  onNext,
}) => {
  const classes = useStyles({})
  const [cloudProviders, loading] = useDataLoader(cloudProviderActions.list)
  const hasAwsProvider = !!cloudProviders.some((provider) => provider.type === CloudProviders.Aws)

  const updateFqdns = (values, setFieldValue) => (value, label) => {
    const name = values.name || wizardContext.name

    const api = `${name}-api.${label}`
    setFieldValue('externalDnsName')(api)
    setWizardContext({ externalDnsName: api })

    const service = `${name}-service.${label}`
    setFieldValue('serviceFqdn')(service)
    setWizardContext({ serviceFdqn: service })
  }

  const handleRegionChange = (region) =>
    setWizardContext({ azs: [], cloudProviderRegionId: region })

  const handleClusterDomainUpdate = (values, setFieldValues) => updateFqdns(values, setFieldValues)

  return (
    <WizardStep stepId="one-click" onNext={onNext}>
      {loading ? null : hasAwsProvider ? (
        <ValidatedForm
          classes={{ root: classes.validatedFormContainer }}
          fullWidth
          initialValues={wizardContext}
          onSubmit={setWizardContext}
          triggerSubmit={onNext}
          elevated={false}
        >
          {({ setFieldValue, values }) => (
            <>
              <FormFieldCard
                title="Cluster Configuration"
                link={
                  <ExternalLink textVariant="caption2" url={awsPrerequisitesLink}>
                    AWS Cluster Help
                  </ExternalLink>
                }
              >
                <ClusterNameField setWizardContext={setWizardContext} />

                <CloudProviderField
                  cloudProviderType={CloudProviders.Aws}
                  onChange={getParamsUpdater('cloudProviderId')}
                />

                <CloudProviderRegionField
                  providerType={CloudProviders.Aws}
                  cloudProviderId={params.cloudProviderId}
                  onChange={handleRegionChange}
                  //value={wizardContext.cloudProviderRegionId}
                />

                {values.region && (
                  <AwsAvailabilityZoneField
                    cloudProviderId={params.cloudProviderId}
                    cloudProviderRegionId={params.cloudProviderRegionId}
                    wizardContext={wizardContext}
                    setWizardContext={setWizardContext}
                  />
                )}

                <SshKeyField
                  sshKeyPicklist={AwsClusterSshKeyPickList}
                  cloudProviderId={params.cloudProviderId}
                  cloudProviderRegionId={params.cloudProviderRegionId}
                />

                <ClusterDomainField
                  cloudProviderId={params.cloudProviderId}
                  cloudProviderRegionId={params.cloudProviderRegionId}
                  onChange={handleClusterDomainUpdate(values, setFieldValue)}
                  required={!values.usePf9Domain}
                  disabled={values.usePf9Domain}
                />
              </FormFieldCard>

              <FormFieldCard title="Default Settings for New Cluster">
                <FormReviewTable data={wizardContext} columns={columns} />
              </FormFieldCard>
            </>
          )}
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

export default OneClickAwsCluster

const useStyles = makeStyles<Theme>((theme) => ({
  validatedFormContainer: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
}))
