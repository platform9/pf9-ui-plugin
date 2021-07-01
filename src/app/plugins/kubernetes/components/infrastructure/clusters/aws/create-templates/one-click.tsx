import React, { FC, useCallback, useMemo } from 'react'
import ExternalLink from 'core/components/ExternalLink'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { CloudDefaults, CloudProviders } from 'k8s/components/infrastructure/cloudProviders/model'
import { awsPrerequisitesLink } from 'k8s/links'
import ClusterNameField from '../../form-components/name'
import AwsClusterSshKeyPickList from '../AwsClusterSshKeyPicklist'
import WizardStep from 'core/components/wizard/WizardStep'
import FormReviewTable from 'core/components/validatedForm/review-table'
import { defaultEtcBackupPath, UserPreferences } from 'app/constants'
import { makeStyles } from '@material-ui/core/styles'
import Theme from 'core/themes/model'
import CloudProviderRegionField from '../../form-components/cloud-provider-region'
import CloudProviderField from '../../form-components/cloud-provider'
import SshKeyField from '../../form-components/ssh-key-picklist'
import ClusterDomainField from '../../form-components/cluster-domain'
import AwsAvailabilityZoneField from '../aws-availability-zone'
import { castBoolToStr } from 'utils/misc'
import KubernetesVersion from '../../form-components/kubernetes-version'
import { awsClusterTracking } from '../../tracking'
import { ClusterCreateTypes } from '../../model'
import { CalicoDetectionTypes } from '../../form-components/calico-network-fields'
import useScopedPreferences from 'core/session/useScopedPreferences'
import { isEmpty } from 'ramda'

export const initialContext = {
  containersCidr: '10.20.0.0/22',
  servicesCidr: '10.21.0.0/22',
  network: 'newPublic',
  runtimeConfigOption: 'default',
  networkPlugin: 'calico',
  numMasters: 1,
  numWorkers: 0,
  masterFlavor: 't3.xlarge',
  workerFlavor: 't3.xlarge',
  allowWorkloadsOnMaster: true,
  ami: 'ubuntu',
  calicoIpIpMode: 'Always',
  calicoNatOutgoing: true,
  calicoBlockSize: '26',
  mtuSize: 1440,
  etcdBackup: true,
  etcdStoragePath: defaultEtcBackupPath,
  etcdBackupInterval: 60 * 24,
  prometheusMonitoringEnabled: true,
  usePf9Domain: false,
  networkStack: 'ipv4',
  privileged: true,
  calicoDetectionMethod: CalicoDetectionTypes.FirstFound,
  azs: [],
  domainId: '',
}

const columns = [
  { id: 'numMasters', label: 'Master nodes' },
  { id: 'numWorkers', label: 'Worker nodes' },
  { id: 'masterFlavor', label: 'Master node instance type' },
  { id: 'workerFlavor', label: 'Worker node instance type' },
  {
    id: 'allowWorkloadsOnMaster',
    label: 'Enable workloads on all master nodes',
    render: (value) => castBoolToStr()(value),
  },
  { id: 'ami', label: 'Operating System', insertDivider: true },
  { id: 'network', label: 'Network' },
  { id: 'calicoIpIpMode', label: 'IP in IP Encapsulation Mode' },
  { id: 'calicoNatOutgoing', label: 'NAT Outgoing', render: (value) => castBoolToStr()(value) },
  { id: 'calicoBlockSize', label: 'Block Size' },
  { id: 'mtuSize', label: 'MTU Size' },
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

const trackingFields = {
  platform: CloudProviders.Aws,
  target: ClusterCreateTypes.OneClick,
}

const useStyles = makeStyles<Theme>((theme) => ({
  validatedFormContainer: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
}))

interface Props {
  wizardContext: any
  setWizardContext: any
  onNext: any
}

const OneClickAwsCluster: FC<Props> = ({ wizardContext, setWizardContext, onNext }) => {
  const classes = useStyles({})
  const { prefs } = useScopedPreferences('defaults')
  const cloudDefaults = useMemo(() => prefs[UserPreferences.Aws] || {}, [prefs])

  const updateFqdns = (values) => (value, label) => {
    setWizardContext({ domainId: value })

    const name = values.name || wizardContext.name

    const api = `${name}-api.${label}`
    setWizardContext({ externalDnsName: api })

    const service = `${name}-service.${label}`
    setWizardContext({ serviceFqdn: service })
  }

  const handleClusterDomainUpdate = (values) => updateFqdns(values)

  const handleCloudProviderChange = (values) => (value) => {
    setWizardContext({
      cloudProviderId: value,
    })

    // Populate the form with default values from the pref store AFTER the user chooses the
    // cloud provider. This is to maintain form order. Cloud provider ID is needed to populate the options
    // for the rest of the fields

    setCloudDefaults(values)
  }

  const setCloudDefaults = useCallback(
    (values) => {
      if (isEmpty(cloudDefaults)) return
      setWizardContext({ ...cloudDefaults, domainId: cloudDefaults[CloudDefaults.DomainLabel] })
      updateFqdns(values)(
        cloudDefaults[CloudDefaults.Domain],
        cloudDefaults[CloudDefaults.DomainLabel],
      )
    },
    [cloudDefaults],
  )

  return (
    <WizardStep stepId="one-click" onNext={awsClusterTracking.oneClick(trackingFields)}>
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
              {/* Cluster Name */}
              <ClusterNameField setWizardContext={setWizardContext} />

              {/* Cloud Provider */}
              <CloudProviderField
                cloudProviderType={CloudProviders.Aws}
                wizardContext={wizardContext}
                setWizardContext={setWizardContext}
                onChange={handleCloudProviderChange(values)}
              />

              {/* Cloud Provider Region */}
              <CloudProviderRegionField
                cloudProviderType={CloudProviders.Aws}
                values={values}
                wizardContext={wizardContext}
                onChange={(region) => setWizardContext({ azs: [] })}
                disabled={!values.cloudProviderId && !values.region}
              />

              {/* AWS Availability Zone */}
              {values.region && (
                <AwsAvailabilityZoneField
                  values={values}
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                  allowMultiSelect={false}
                />
              )}

              {/* SSH Key */}
              <SshKeyField
                dropdownComponent={AwsClusterSshKeyPickList}
                values={values}
                wizardContext={wizardContext}
                setWizardContext={setWizardContext}
              />

              {/* Cluster Domain */}
              <ClusterDomainField
                values={values}
                value={wizardContext.domainId}
                onChange={handleClusterDomainUpdate(values)}
                required={false}
                disabled={wizardContext.usePf9Domain}
              />

              <KubernetesVersion
                wizardContext={wizardContext}
                setWizardContext={setWizardContext}
              />
            </FormFieldCard>

            <FormFieldCard title="Default Settings for New Cluster">
              <FormReviewTable data={wizardContext} columns={columns} />
            </FormFieldCard>
          </>
        )}
      </ValidatedForm>
    </WizardStep>
  )
}

export default OneClickAwsCluster
