import { Divider, makeStyles, Theme } from '@material-ui/core'
import { defaultEtcBackupPath } from 'app/constants'
import Alert from 'core/components/Alert'
import CodeBlock from 'core/components/CodeBlock'
import ExternalLink from 'core/components/ExternalLink'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import FormReviewTable from 'core/components/validatedForm/review-table'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import WizardStep from 'core/components/wizard/WizardStep'
import useDataLoader from 'core/hooks/useDataLoader'
import {
  loadCloudProviderDetails,
  loadCloudProviderRegionDetails,
} from 'k8s/components/infrastructure/cloudProviders/actions'
import { CloudProviders } from 'k8s/components/infrastructure/cloudProviders/model'
import { azurePrerequisitesLink } from 'k8s/links'
import React, { FC, useCallback } from 'react'
import { pathStrOr } from 'utils/fp'
import { castBoolToStr } from 'utils/misc'
import { trackEvent } from 'utils/tracking'
import AdvancedApiConfigFields from '../../form-components/advanced-api-config'
import AllowWorkloadsOnMasterField from '../../form-components/allow-workloads-on-master'
import ApiFqdnField from '../../form-components/api-fqdn'
import AssignPublicIpsField from '../../form-components/assign-public-ips'
import CloudProviderField from '../../form-components/cloud-provider'
import CloudProviderRegionField from '../../form-components/cloud-provider-region'
import ClusterTemplatesField from '../../form-components/cluster-templates'
import ContainerAndServicesCidrField from '../../form-components/container-and-services-cidr'
import ExistingNetworkField from '../../form-components/existing-network'
import HttpProxyField from '../../form-components/http-proxy'
import KubernetesVersion from '../../form-components/kubernetes-version'
import MasterNodeSkuField from '../../form-components/master-node-sku'
import MasterNodeSubnetField from '../../form-components/master-node-subnet'
import ClusterNameField from '../../form-components/name'
import NetworksField from '../../form-components/networks'
import NumMasterNodesField from '../../form-components/num-master-nodes'
import NumWorkerNodesField from '../../form-components/num-worker-nodes'
import PrivilegedField from '../../form-components/privileged'
import ResourceGroupField from '../../form-components/resource-group'
import SshKeyTextField from '../../form-components/ssh-key-textfield'
import TagsField from '../../form-components/tags'
import WorkerNodeSkuField from '../../form-components/worker-node-sku'
import WorkerNodeSubnetField from '../../form-components/worker-node-subnet'
import AzureAvailabilityZoneFields from '../azure-availability-zone'
import AzureResourceGroupPicklist from '../AzureResourceGroupPicklist'
import AzureSkuPicklist from '../AzureSkuPicklist'
import AzureSubnetPicklist from '../AzureSubnetPicklist'
import AzureVnetPicklist from '../AzureVnetPicklist'
import Text from 'core/elements/text'
import MakeMasterNodesMasterAndWorkerField from '../../form-components/make-master-nodes-master-and-worker'
import { AddonTogglers } from '../../form-components/cluster-addon-manager'

export const initialContext = {
  template: 'small',
  masterSku: 'Standard_A1_v2',
  workerSku: 'Standard_A1_v2',
  numMasters: 1,
  numWorkers: 1,
  enableCAS: false,
  usePf9Domain: true,
  network: 'newNetwork',
  containersCidr: '10.20.0.0/16',
  servicesCidr: '10.21.0.0/16',
  networkPlugin: 'flannel',
  runtimeConfigOption: 'default',
  useAllAvailabilityZones: true,
  assignPublicIps: false,
  etcdStoragePath: defaultEtcBackupPath,
  etcdBackupInterval: 60 * 24,
  prometheusMonitoringEnabled: true,
  tags: [],
  appCatalogEnabled: false,
}

const renderNumWorkersCellValue = (data) => (cellValue) => {
  return data.enableCAS ? `Min ${data.numWorkers} - Max ${data.numMaxWorkers}` : data.numWorkers
}

const renderTagRow = ({ key, value }) => (
  <tr>
    <td>
      <CodeBlock>{key}</CodeBlock>
    </td>
    <td>
      <CodeBlock>{value}</CodeBlock>
    </td>
  </tr>
)

const renderTags = (keyValuePairs) => {
  return (
    <table>
      <tbody>{keyValuePairs.map((pair) => renderTagRow(pair))}</tbody>
    </table>
  )
}

const getReviewTableColumns = (data) => {
  return [
    { id: 'name', label: 'Name' },
    { id: 'location', label: 'Region' },
    { id: 'masterSku', label: 'Master node SKU', insertDivider: true },
    { id: 'workerSku', label: 'Worker node SKU' },
    { id: 'numMasters', label: 'Number of master nodes' },
    { id: 'numWorkers', label: 'Number of worker nodes', render: renderNumWorkersCellValue(data) },
    {
      id: 'allowWorkloadsOnMaster',
      label: 'Enable workloads on all master nodes',
      render: (value) => castBoolToStr()(value),
    },
    { id: 'enableCAS', label: 'Auto scaling', render: (value) => castBoolToStr()(value) },
    { id: 'sshKey', label: 'SSH Key', insertDivider: true },
    {
      id: 'assignPublicIps',
      label: "Assign public IP's",
      render: (value) => castBoolToStr()(value),
    },
    { id: 'externalDnsName', label: 'API FQDN' },
    { id: 'containersCidr', label: 'Containers CIDR' },
    { id: 'servicesCidr', label: 'Services CIDR' },
    { id: 'privileged', label: 'Privileged', render: (value) => castBoolToStr()(value) },
    {
      id: 'prometheusMonitoringEnabled',
      label: 'Prometheus monitoring',
      render: (value) => castBoolToStr()(value),
      insertDivider: true,
    },
    {
      id: 'tags',
      label: 'Tags',
      render: (keyValuePairs) => renderTags(keyValuePairs),
    },
  ]
}

const configOnNext = (context) => {
  trackEvent('WZ New Azure Cluster 1 Master Nodes', {
    wizard_step: 'Cluster Configuration',
    wizard_state: 'In-Progress',
    wizard_progress: '1 of 4',
    wizard_name: 'Add New Azure Cluster',
    cluster_name: context.name,
    cluster_region: context.location,
    cluster_template: context.template,
    allow_workloads_on_master: context.allowWorkloadsOnMaster,
    master_nodes: context.numMasters,
    worker_nodes: context.numWorkers,
    master_sku: context.masterSku,
    worker_sku: context.workerSku,
  })
}

const networkOnNext = (context) => {
  trackEvent('WZ New Azure Cluster 2 Networking Details', {
    wizard_step: 'Network Info',
    wizard_state: 'In-Progress',
    wizard_progress: '2 of 4',
    wizard_name: 'Add New Azure Cluster',
    network_configuration: context.network,
    network_backend: context.networkPlugin,
  })
}

const advancedOnNext = (context) => {
  trackEvent('WZ New Azure Cluster 3 Advanced Configuration', {
    wizard_step: 'Advanced Configuration',
    wizard_state: 'In-Progress',
    wizard_progress: '3 of 4',
    wizard_name: 'Add New Azure Cluster',
    enable_etcd_backup: !!context.enableEtcdBackup,
    enable_monitoring: !!context.prometheusMonitoringEnabled,
  })
}

const reviewOnNext = (context) => {
  trackEvent('WZ New Azure Cluster 4 Review', {
    wizard_step: 'Review',
    wizard_state: 'Finished',
    wizard_progress: '4 of 4',
    wizard_name: 'Add New Azure Cluster',
  })
}

const networkOptions = [
  { label: 'Select existing', value: 'existing' },
  { label: 'Create new network', value: 'newNetwork' },
]

const templateOptions = [
  { label: 'Sm - Single Node Master & Worker (Standard_A1_v2)', value: 'small' },
  { label: 'Md - 1 Master + 3 Workers (Standard_A2_v2)', value: 'medium' },
  { label: 'Lg - 3 Masters + 5 Workers (Standard_A4_v2)', value: 'large' },
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
      masterSku: 'Standard_A1_v2',
      workerSku: 'Standard_A1_v2',
    },
    medium: {
      numMasters: 1,
      numWorkers: 3,
      allowWorkloadsOnMaster: false,
      masterSku: 'Standard_A2_v2',
      workerSku: 'Standard_A2_v2',
    },
    large: {
      numMasters: 3,
      numWorkers: 5,
      allowWorkloadsOnMaster: false,
      masterSku: 'Standard_A4_v2',
      workerSku: 'Standard_A4_v2',
    },
    custom: {
      numMasters: 3,
      numWorkers: 5,
      allowWorkloadsOnMaster: false,
      masterSku: 'Standard_A4_v2',
      workerSku: 'Standard_A4_v2',
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
    margin: theme.spacing(3, 0),
  },
}))

interface Props {
  wizardContext: any
  setWizardContext: any
  onNext: any
}

const AdvancedAzureCluster: FC<Props> = ({ wizardContext, setWizardContext, onNext }) => {
  const classes = useStyles()

  const [cloudProviderDetails] = useDataLoader(loadCloudProviderDetails, {
    cloudProviderId: wizardContext.cloudProviderId,
  })

  const [cloudProviderRegionDetails] = useDataLoader(loadCloudProviderRegionDetails, {
    cloudProviderId: wizardContext.cloudProviderId,
    cloudProviderRegionId: wizardContext.cloudProviderRegionId,
  })
  const virtualNetworks = pathStrOr([], '0.virtualNetworks', cloudProviderRegionDetails)

  const mapRegionName = useCallback(
    (displayName) => {
      return cloudProviderDetails.find((x) => x.DisplayName === displayName).RegionName
    },
    [cloudProviderDetails],
  )

  const handleRegionChange = useCallback(
    (displayName) => {
      const regionName = mapRegionName(displayName)
      setWizardContext({ location: regionName })
    },
    [cloudProviderDetails],
  )

  return (
    <>
      {/* Step 1 - Cluster Configuration */}
      <WizardStep stepId="config" label="Cluster Configuration" onNext={configOnNext}>
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
                  <ExternalLink textVariant="caption2" url={azurePrerequisitesLink}>
                    Azure Cluster Help
                  </ExternalLink>
                }
              >
                {/* Cluster Name */}
                <ClusterNameField />

                {/* Cloud Provider */}
                <CloudProviderField cloudProviderType={CloudProviders.Azure} />

                {/* Cloud Provider Region */}
                <CloudProviderRegionField
                  cloudProviderType={CloudProviders.Azure}
                  values={values}
                  onChange={handleRegionChange}
                />

                {/* SSH Key */}
                <SshKeyTextField />

                {/* Template Chooser */}
                <ClusterTemplatesField
                  options={templateOptions}
                  onChange={handleTemplateChoice({
                    setWizardContext,
                    setFieldValue,
                  })}
                />

                {wizardContext.template !== 'custom' && <AllowWorkloadsOnMasterField />}

                {wizardContext.template === 'custom' && (
                  <>
                    {/* Use All Availability Zones Checkbox Field and Azure Availability Zone Chooser */}
                    <AzureAvailabilityZoneFields
                      values={values}
                      setWizardContext={setWizardContext}
                    />

                    {/* Num master nodes */}
                    <NumMasterNodesField />

                    {/* Master node SKU */}
                    <MasterNodeSkuField dropdownComponent={AzureSkuPicklist} values={values} />

                    {/* Num worker nodes */}
                    <NumWorkerNodesField />

                    {/* Worker node SKU */}
                    <WorkerNodeSkuField dropdownComponent={AzureSkuPicklist} values={values} />

                    {/* Allow workloads on masters */}
                    <AllowWorkloadsOnMasterField />
                  </>
                )}
              </FormFieldCard>
              <FormFieldCard title="Cluster Settings">
                {/* Kubernetes Version */}
                <KubernetesVersion />

                <Divider className={classes.divider} />

                {/* App & Container Settings */}
                <Text variant="caption1">Application & Container Settings</Text>
                <MakeMasterNodesMasterAndWorkerField />
                <PrivilegedField wizardContext={wizardContext} />

                <Divider className={classes.divider} />

                {/* Managed Add-Ons */}
                <Text variant="caption1">Cluster Add-Ons</Text>
                <AddonTogglers
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
              <FormFieldCard title="Network Info">
                {/* Assign public IP's */}
                <AssignPublicIpsField />

                {/* Network */}
                <NetworksField options={networkOptions} />

                {values.network === 'existing' && virtualNetworks.length > 0 && (
                  <>
                    {/* Resource group */}
                    <ResourceGroupField
                      dropdownComponent={AzureResourceGroupPicklist}
                      wizardContext={wizardContext}
                    />

                    {/* Existing network.  I don't get the point of this field. */}
                    <ExistingNetworkField
                      dropdownComponent={AzureVnetPicklist}
                      values={values}
                      wizardContext={setWizardContext}
                    />

                    {/* Master node subnet */}
                    <MasterNodeSubnetField
                      dropdownComponent={AzureSubnetPicklist}
                      wizardContext={wizardContext}
                      values={values}
                    />

                    {/* Worker node subnet */}
                    <WorkerNodeSubnetField
                      dropdownComponent={AzureSubnetPicklist}
                      wizardContext={wizardContext}
                      values={values}
                    />
                  </>
                )}

                {values.network === 'existing' && virtualNetworks.length == 0 && (
                  <Alert
                    small
                    variant="error"
                    message={`No existing virtual networks in location ${wizardContext.cloudProviderRegionId}.`}
                  />
                )}

                {/* API FQDN */}
                <ApiFqdnField />

                {/* Containers CIDR and Services CIDR */}
                <ContainerAndServicesCidrField />

                {/* HTTP proxy */}
                <HttpProxyField />
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
                {/* Advanced API Configuration & Custom Runtime Config */}
                <AdvancedApiConfigFields values={values} />

                {/* Enable Application Catalog */}
                {/* <CheckboxField
                        id="appCatalogEnabled"
                        label="Enable Application Catalog"
                        info="Enable the Helm Application Catalog on this cluster"
               /> */}

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
            <FormReviewTable data={wizardContext} columns={getReviewTableColumns(wizardContext)} />
          </FormFieldCard>
        </ValidatedForm>
      </WizardStep>
    </>
  )
}

export default AdvancedAzureCluster
