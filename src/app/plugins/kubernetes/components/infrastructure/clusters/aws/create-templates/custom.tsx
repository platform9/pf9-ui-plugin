import React from 'react'
import { defaultEtcBackupPath } from 'app/constants'
import WizardStep from 'core/components/wizard/WizardStep'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import ExternalLink from 'core/components/ExternalLink'
import { awsPrerequisitesLink } from 'k8s/links'
import { PromptToAddProvider } from 'k8s/components/infrastructure/cloudProviders/PromptToAddProvider'
import { CloudProviders } from 'k8s/components/infrastructure/cloudProviders/model'
import { routes } from 'core/utils/routes'
import ClusterNameField from '../../form-components/name'
import useDataLoader from 'core/hooks/useDataLoader'
import { cloudProviderActions } from 'k8s/components/infrastructure/cloudProviders/actions'
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
import WorkerNodeInstanceTypeField from '../../form-components/worker-node-instance-type'
import AwsRegionFlavorPicklist from '../AwsRegionFlavorPicklist'
import AllowWorkloadsonMasterField from '../../form-components/allow-workloads-on-master'
import AutoScalingFields from '../../form-components/auto-scaling'
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
import EtcdBackupFields from '../../form-components/etcd-backup'
import PrometheusMonitoringField from '../../form-components/prometheus-monitoring'
import TagsField from '../../form-components/tags'
import CustomAmiField from '../../form-components/custom-ami'
import AdvancedApiConfigFields from '../../form-components/advanced-api-config'
import FormReviewTable from 'core/components/validatedForm/review-table'
import { capitalizeString, castBoolToStr } from 'utils/misc'
import CodeBlock from 'core/components/CodeBlock'
import KubernetesVersionField from '../../form-components/kubernetes-version'
import ManagedAddOnsField from '../../form-components/managed-add-ons'
import AppAndContainerSettingsFields from '../../form-components/app-container-settings'
import { Divider } from '@material-ui/core'

export const templateTitle = 'Custom'

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
  containersCidr: '10.20.0.0/16',
  servicesCidr: '10.21.0.0/16',
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
}

const renderNumWorkersCellValue = (data) => {
  return data.enableCAS ? `Min ${data.numWorkers} - Max ${data.numMaxWorkers}` : data.numWorkers
}

const renderTags = (key, value) => (
  <>
    <CodeBlock>{key}</CodeBlock>
    <CodeBlock>{value}</CodeBlock>
  </>
)

const getReviewTableColumns = (data) => {
  return [
    { id: 'name', label: 'Name' },
    { id: 'region', label: 'Region' },
    { id: 'ami', label: 'Operating System' },
    { id: 'masterFlavor', label: 'Master node instance type', insertDivider: true },
    { id: 'workerFlavor', label: 'Worker node instance type' },
    { id: 'numMasters', label: 'Num master nodes' },
    {
      id: 'numWorkers',
      label: 'Num worker nodes',
      render: (value) => renderNumWorkersCellValue(data),
    },
    {
      id: 'allowWorkloadsOnMaster',
      label: 'Enable workloads on all master nodes',
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
    { id: 'prometheusMonitoringEnabled', label: 'Prometheus monitoring' },
    {
      id: 'tags',
      label: 'Tags',
      render: (values) => values.map(({ key, value }) => renderTags(key, value)),
    },
  ]
}

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
const handleTemplateChoice = ({ setWizardContext, setFieldValue }) => (option) => {
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
    setWizardContext({ template: option })
    setWizardContext(options[option])
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

const AdvancedAwsCluster = ({ wizardContext, setWizardContext, onNext }) => {
  const classes = useStyles()
  const [cloudProviders, loading] = useDataLoader(cloudProviderActions.list)
  const hasAwsProvider = !!cloudProviders.some((provider) => provider.type === CloudProviders.Aws)

  return (
    <>
      {/* Step 1 - Cluster Configuration */}
      <WizardStep stepId="config" label="Network Configuration" onNext={configOnNext}>
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
                  {/* Cluster Name */}
                  <ClusterNameField setWizardContext={setWizardContext} />

                  {/* Cloud Provider */}
                  <CloudProviderField
                    cloudProviderType={CloudProviders.Aws}
                    setWizardContext={setWizardContext}
                  />

                  {/* AWS Region */}
                  <CloudProviderRegionField
                    cloudProviderType={CloudProviders.Aws}
                    wizardContext={wizardContext}
                    onChange={(region) =>
                      setWizardContext({ azs: [], cloudProviderRegionId: region })
                    }
                  />

                  {/* AWS Availability Zone */}
                  {wizardContext.region && (
                    <AwsAvailabilityZoneField
                      wizardContext={wizardContext}
                      setWizardContext={setWizardContext}
                    />
                  )}

                  {/* SSH Key */}
                  <SshKeyField
                    dropdownComponent={AwsClusterSshKeyPicklist}
                    wizardContext={wizardContext}
                  />

                  {/* Template Chooser */}
                  <ClusterTemplatesField
                    options={templateOptions}
                    onChange={handleTemplateChoice({
                      setWizardContext,
                      setFieldValue,
                    })}
                  />

                  {wizardContext.template === 'custom' && (
                    <>
                      {/* Operating System */}
                      <OperatingSystemField />

                      {/* Master node instance type */}
                      <MasterNodeInstanceTypeField wizardContext={wizardContext} />

                      {/* Num master nodes */}
                      <NumMasterNodesField />

                      {/* Worker node instance type */}
                      <WorkerNodeInstanceTypeField
                        dropdownComponent={AwsRegionFlavorPicklist}
                        wizardContext={wizardContext}
                      />

                      {/* Num worker nodes */}
                      <NumWorkerNodesField />

                      {/* Workloads on masters */}
                      <AllowWorkloadsonMasterField />

                      {/* Enable Auto Scaling Checkbox + Max Num Worker Nodes Field */}
                      <AutoScalingFields
                        wizardContext={wizardContext}
                        setWizardContext={setWizardContext}
                      />
                    </>
                  )}
                </FormFieldCard>

                <FormFieldCard title="Cluster Settings">
                  <KubernetesVersionField
                    wizardContext={wizardContext}
                    setWizardContext={setWizardContext}
                  />
                  <Divider className={classes.divider} />
                  <AppAndContainerSettingsFields />
                  <Divider className={classes.divider} />
                  <ManagedAddOnsField />
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

      {/* Step 2 0 - Network Info */}
      <WizardStep stepId="network" label="Network Info" onNext={networkOnNext}>
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
                  setFieldValue={setFieldValue}
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                />

                {/* API FQDN */}
                <ApiFqdnField
                  required={!wizardContext.usePf9Domain}
                  disabled={wizardContext.usePf9Domain}
                />

                {/* Services FQDN */}
                <ServicesFqdnField required={!values.usePf9Domain} disabled={values.usePf9Domain} />
              </FormFieldCard>

              <FormFieldCard title="Cluster Networking Range & HTTP Proxy">
                {/* Containers & Services CIDR */}
                <ContainerAndServicesCidr />

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
                {values.networkPlugin === 'calico' && (
                  <CalicoNetworkFields
                    wizardContext={wizardContext}
                    setWizardContext={setWizardContext}
                  />
                )}
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
          {({ setFieldValue, values }) => (
            <>
              <FormFieldCard title="Advanced Configuration">
                {/* Privileged */}
                <PrivilegedField wizardContext={setWizardContext} />

                {/* Etcd Backup */}
                <EtcdBackupFields />

                {/* Prometheus monitoring */}
                <PrometheusMonitoringField wizardContext={wizardContext} />

                {/* Advanced API Configuration */}
                <AdvancedApiConfigFields
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                />

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
          <FormFieldCard title="Default Settings for New Cluster">
            <FormReviewTable data={wizardContext} columns={getReviewTableColumns(wizardContext)} />
          </FormFieldCard>
        </ValidatedForm>
      </WizardStep>
    </>
  )
}

export default AdvancedAwsCluster
