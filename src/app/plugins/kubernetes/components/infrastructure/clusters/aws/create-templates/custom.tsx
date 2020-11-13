import React, { FC } from 'react'
import { defaultEtcBackupPath } from 'app/constants'
import WizardStep from 'core/components/wizard/WizardStep'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import ExternalLink from 'core/components/ExternalLink'
import { awsPrerequisitesLink } from 'k8s/links'
import { CloudProviders } from 'k8s/components/infrastructure/cloudProviders/model'
import ClusterNameField from '../../form-components/name'
import { trackEvent } from 'utils/tracking'
import CloudProviderField from '../../form-components/cloud-provider'
import CloudProviderRegionField from '../../form-components/cloud-provider-region'
import AwsAvailabilityZoneField from '../aws-availability-zone'
import SshKeyField from '../../form-components/ssh-key-picklist'
import AwsClusterSshKeyPicklist from '../AwsClusterSshKeyPicklist'
import OperatingSystemField from '../../form-components/operating-system'
import MasterNodeInstanceTypeField from '../../form-components/master-node-instance-type'
import NumMasterNodesField from '../../form-components/num-master-nodes'
import NumWorkerNodesField from '../../form-components/num-worker-nodes'
import AwsRegionFlavorPicklist from '../AwsRegionFlavorPicklist'
import AllowWorkloadsonMasterField from '../../form-components/allow-workloads-on-master'
import ClusterTemplatesField from '../../form-components/cluster-templates'
import { makeStyles } from '@material-ui/core/styles'
import Theme from 'core/themes/model'
import AwsCustomNetworkingFields from '../aws-custom-networking-fields'
import ApiFqdnField from '../../form-components/api-fqdn'
import ServicesFqdnField from '../../form-components/services-fqdn'
import ContainerAndServicesCidr from '../../form-components/container-and-services-cidr'
import HttpProxyField from '../../form-components/http-proxy'
import NetworkBackendField from '../../form-components/network-backend'
import CalicoNetworkFields from '../../form-components/calico-network-fields'
import PrivilegedField from '../../form-components/privileged'
import TagsField, { FormattedTags } from '../../form-components/tags'
import CustomAmiField from '../../form-components/custom-ami'
import AdvancedApiConfigFields from '../../form-components/advanced-api-config'
import FormReviewTable from 'core/components/validatedForm/review-table'
import { capitalizeString, castBoolToStr } from 'utils/misc'
import { Divider } from '@material-ui/core'
import KubernetesVersion from '../../form-components/kubernetes-version'
import Text from 'core/elements/text'
import { AddonTogglers } from '../../form-components/cluster-addon-manager'
import WorkerNodeInstanceTypeField from '../../form-components/worker-node-instance-type'

export const initialContext = {
  template: 'small',
  ami: 'ubuntu',
  masterFlavor: 't2.medium',
  workerFlavor: 't2.medium',
  numMasters: 1,
  numWorkers: 1,
  enableCAS: false,
  usePf9Domain: false,
  network: 'newPublic',
  containersCidr: '10.20.0.0/22',
  servicesCidr: '10.21.0.0/22',
  networkPlugin: 'flannel',
  mtuSize: 1440,
  runtimeConfigOption: 'default',
  isPrivate: false,
  internalElb: false,
  etcdStoragePath: defaultEtcBackupPath,
  etcdBackupInterval: 60 * 24, // in minutes
  prometheusMonitoringEnabled: true,
  tags: [],
  appCatalogEnabled: false,
  networkStack: 'ipv4',
}

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'region', label: 'Region' },
  { id: 'ami', label: 'Operating System' },
  { id: 'masterFlavor', label: 'Master node instance type', insertDivider: true },
  { id: 'workerFlavor', label: 'Worker node instance type' },
  { id: 'numMasters', label: 'Master nodes' },
  { id: 'numWorkers', label: 'Worker nodes' },
  {
    id: 'allowWorkloadsOnMaster',
    label: 'Make Master nodes Master + Worker',
    render: (value) => castBoolToStr()(value),
  },
  { id: 'enableCAS', label: 'Auto scaling', render: (value) => castBoolToStr()(value) },
  { id: 'sshKey', label: 'SSH Key', insertDivider: true },
  { id: 'externalDnsName', label: 'API FQDN' },
  { id: 'containersCidr', label: 'Containers CIDR' },
  { id: 'servicesCidr', label: 'Services CIDR' },
  {
    id: 'networkPlugin',
    label: 'CNI',
    render: (value) => capitalizeString(value),
  },
  {
    id: 'privileged',
    label: 'Privileged',
    render: (value) => castBoolToStr()(value),
    insertDivider: true,
  },
  {
    id: 'prometheusMonitoringEnabled',
    label: 'Prometheus monitoring',
    render: (value) => castBoolToStr()(value),
  },
  {
    id: 'tags',
    label: 'Tags',
    renderArray: true,
    render: (value) => <FormattedTags tags={value} />,
  },
]

// Segment tracking for wizard steps
const configOnNext = (context) => {
  trackEvent('WZ New AWS Cluster 1 Master Nodes', {
    wizard_step: 'Cluster Configuration',
    wizard_state: 'In-Progress',
    wizard_progress: '1 of 4',
    wizard_name: 'Add New AWS Cluster',
    cluster_name: context.name,
    cluster_region: context.region,
    cluster_azs: context.azs,
    cluster_template: context.template,
    allow_workloads_on_master: context.allowWorkloadsOnMaster,
    master_nodes: context.numMasters,
    worker_nodes: context.numWorkers,
    master_flavor: context.masterFlavor,
    worker_flavor: context.workerFlavor,
  })
}

const networkOnNext = (context) => {
  trackEvent('WZ New AWS Cluster 2 Networking Details', {
    wizard_step: 'Network Info',
    wizard_state: 'In-Progress',
    wizard_progress: '2 of 4',
    wizard_name: 'Add New AWS Cluster',
    network_configuration: context.network,
    network_backend: context.networkPlugin,
  })
}

const advancedOnNext = (context) => {
  trackEvent('WZ New AWS Cluster 3 Advanced Configuration', {
    wizard_step: 'Advanced Configuration',
    wizard_state: 'In-Progress',
    wizard_progress: '3 of 4',
    wizard_name: 'Add New AWS Cluster',
    enable_etcd_backup: !!context.enableEtcdBackup,
    enable_monitoring: !!context.prometheusMonitoringEnabled,
  })
}

const reviewOnNext = (context) => {
  trackEvent('WZ New AWS Cluster 4 Review', {
    wizard_step: 'Review',
    wizard_state: 'Finished',
    wizard_progress: '4 of 4',
    wizard_name: 'Add New AWS Cluster',
  })
}

const templateOptions = [
  { label: 'Sm - Single Node Master & Worker (t2.medium)', value: 'small' },
  { label: 'Md - 1 Master + 3 Workers (t2.medium)', value: 'medium' },
  { label: 'Lg - 3 Masters + 5 Workers (t2.large)', value: 'large' },
  { label: 'custom', value: 'custom' },
]

// The template picker allows the user to fill out some useful defaults for the fields.
// This greatly simplifies the number of fields that need to be filled out.
// Presets are as follows:
// small (single dev) - 1 node master + worker - select instance type (default t2.small)
// medium (internal team) - 1 master + 3 workers - select instance (default t2.medium)
// large (production) - 3 master + 5 workers - no workload on masters (default t2.large)
const handleTemplateChoice = ({ setFieldValue }) => (option) => {
  const options = {
    small: {
      numMasters: 1,
      numWorkers: 0,
      allowWorkloadsOnMaster: true,
      masterFlavor: 't2.medium',
      workerFlavor: 't2.medium',
    },
    medium: {
      numMasters: 1,
      numWorkers: 3,
      allowWorkloadsOnMaster: false,
      masterFlavor: 't2.medium',
      workerFlavor: 't2.medium',
    },
    large: {
      numMasters: 3,
      numWorkers: 5,
      allowWorkloadsOnMaster: false,
      masterFlavor: 't2.large',
      workerFlavor: 't2.large',
    },
    custom: {
      numMasters: 3,
      numWorkers: 5,
      allowWorkloadsOnMaster: false,
      masterFlavor: 't2.large',
      workerFlavor: 't2.large',
    },
  }

  // setImmediate is used because we need the fields to show up in the form before their values can be set
  setImmediate(() => {
    Object.entries(options[option]).forEach(([key, value]) => {
      setFieldValue(key)(value)
    })
  })
}

const useStyles = makeStyles<Theme>((theme) => ({
  validatedFormContainer: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
  divider: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}))

interface Props {
  wizardContext: any
  setWizardContext: any
  onNext: any
}

const AdvancedAwsCluster: FC<Props> = ({ wizardContext, setWizardContext, onNext }) => {
  const classes = useStyles()

  return (
    <>
      {/* Step 1 - Cluster Configuration */}
      <WizardStep stepId="config" label="Network Configuration" onNext={configOnNext}>
        <ValidatedForm
          fullWidth
          classes={{ root: classes.validatedFormContainer }}
          initialValues={wizardContext}
          onSubmit={setWizardContext}
          triggerSubmit={onNext}
          withAddonManager
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
                <CloudProviderField cloudProviderType={CloudProviders.Aws} />

                {/* AWS Region */}
                <CloudProviderRegionField
                  cloudProviderType={CloudProviders.Aws}
                  values={values}
                  onChange={(region) => setWizardContext({ azs: [] })}
                />

                {/* AWS Availability Zone */}
                {values.region && (
                  <AwsAvailabilityZoneField
                    values={values}
                    wizardContext={wizardContext}
                    setWizardContext={setWizardContext}
                    allowMultiSelect
                  />
                )}

                {/* SSH Key */}
                <SshKeyField dropdownComponent={AwsClusterSshKeyPicklist} values={values} />

                {/* Template Chooser */}
                <ClusterTemplatesField
                  options={templateOptions}
                  onChange={handleTemplateChoice({
                    setFieldValue,
                  })}
                />

                {values.template === 'custom' && (
                  <>
                    {/* Operating System */}
                    <OperatingSystemField />

                    {/* Master node instance type */}
                    <MasterNodeInstanceTypeField
                      dropdownComponent={AwsRegionFlavorPicklist}
                      values={values}
                    />

                    {/* Num master nodes */}
                    <NumMasterNodesField />

                    {/* Worker node instance type */}
                    <WorkerNodeInstanceTypeField
                      dropdownComponent={AwsRegionFlavorPicklist}
                      values={values}
                    />

                    {/* Num worker nodes */}
                    <NumWorkerNodesField />
                  </>
                )}
              </FormFieldCard>

              <FormFieldCard title="Cluster Settings">
                {/* Kubernetes Version */}
                <KubernetesVersion />
                <Divider className={classes.divider} />

                {/* App & Container Settings */}
                <Text variant="caption1">Application & Container Settings</Text>

                {/* Workloads on masters */}
                <AllowWorkloadsonMasterField setWizardContext={setWizardContext} />

                <PrivilegedField
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                />

                <Divider className={classes.divider} />

                {/* Managed Add-Ons */}
                <Text variant="caption1">Managed Add-Ons</Text>
                <AddonTogglers
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                  addons={['etcdBackup', 'prometheusMonitoringEnabled', 'enableCAS']}
                />
              </FormFieldCard>
            </>
          )}
        </ValidatedForm>
      </WizardStep>

      {/* Step 2 - Network Info */}
      <WizardStep stepId="network" label="Network Info" onNext={networkOnNext}>
        <ValidatedForm
          classes={{ root: classes.validatedFormContainer }}
          fullWidth
          initialValues={wizardContext}
          onSubmit={setWizardContext}
          triggerSubmit={onNext}
          elevated={false}
        >
          {({ values }) => (
            <>
              <FormFieldCard title="Networking Details">
                {/* Use PF9 domain */}
                {/* <CheckboxField
                      id="usePf9Domain"
                      label="Use the platform9.net domain"
                      info="Select this option if you want Platform9 to automatically generate the endpoints or if you do not have access to Route 53."
                    /> 
                */}

                {/* AWS Custom Networking Fields */}
                <AwsCustomNetworkingFields
                  setWizardContext={setWizardContext}
                  wizardContext={wizardContext}
                />

                {/* API FQDN */}
                <ApiFqdnField
                  required={!wizardContext.usePf9Domain}
                  disabled={wizardContext.usePf9Domain}
                />

                {/* Services FQDN */}
                <ServicesFqdnField
                  required={!wizardContext.usePf9Domain}
                  disabled={wizardContext.usePf9Domain}
                />
              </FormFieldCard>

              <FormFieldCard title="Cluster Networking Range & HTTP Proxy">
                {/* Containers & Services CIDR */}
                <ContainerAndServicesCidr values={values} />

                {/* HTTP proxy */}
                <HttpProxyField />
              </FormFieldCard>

              <FormFieldCard title="Cluster CNI">
                {/* Network Backend */}
                <NetworkBackendField
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                />

                {/* Calico Network Fields
                    
                    Contains:
                    - IP in IP Encapsulation Mode Field
                    - NAT Outgoing Field
                    - Block Size Field
                    - MTU Size Field
                    
                */}
                {values.networkPlugin === 'calico' && <CalicoNetworkFields values={values} />}
              </FormFieldCard>
            </>
          )}
        </ValidatedForm>
      </WizardStep>

      {/* Step 3 - Advanced Configuration */}
      <WizardStep stepId="advanced" label="Advanced Configuration" onNext={advancedOnNext}>
        <ValidatedForm
          classes={{ root: classes.validatedFormContainer }}
          fullWidth
          initialValues={wizardContext}
          onSubmit={setWizardContext}
          triggerSubmit={onNext}
          elevated={false}
        >
          {({ values }) => (
            <>
              <FormFieldCard title="Advanced Configuration">
                {/* Advanced API Configuration */}
                <AdvancedApiConfigFields values={values} />

                {/* Enable Application Catalog */}
                {/* <CheckboxField
                        id="appCatalogEnabled"
                        label="Enable Application Catalog"
                        info="Enable the Helm Application Catalog on this cluster"
                  /> 
              */}

                {/* Custom AMI */}
                <CustomAmiField />

                {/* Tags */}
                <TagsField />
              </FormFieldCard>
            </>
          )}
        </ValidatedForm>
      </WizardStep>

      {/* Step 4 - Review */}
      <WizardStep stepId="review" label="Review" onNext={reviewOnNext}>
        <ValidatedForm
          classes={{ root: classes.validatedFormContainer }}
          fullWidth
          initialValues={wizardContext}
          onSubmit={setWizardContext}
          triggerSubmit={onNext}
          elevated={false}
        >
          <FormFieldCard title="Finalize & Review">
            <FormReviewTable data={wizardContext} columns={columns} />
          </FormFieldCard>
        </ValidatedForm>
      </WizardStep>
    </>
  )
}

export default AdvancedAwsCluster
