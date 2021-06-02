import { Divider, makeStyles, Theme } from '@material-ui/core'
import { defaultEtcBackupPath, UserPreferences } from 'app/constants'
import Alert from 'core/components/Alert'
import ExternalLink from 'core/components/ExternalLink'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import FormReviewTable from 'core/components/validatedForm/review-table'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import WizardStep from 'core/components/wizard/WizardStep'
import useDataLoader from 'core/hooks/useDataLoader'
import { loadCloudProviderRegionDetails } from 'k8s/components/infrastructure/cloudProviders/actions'
import { CloudDefaults, CloudProviders } from 'k8s/components/infrastructure/cloudProviders/model'
import { azurePrerequisitesLink } from 'k8s/links'
import React, { FC, useCallback, useMemo } from 'react'
import { pathStrOr } from 'utils/fp'
import { castBoolToStr } from 'utils/misc'
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
import TagsField, { FormattedTags } from '../../form-components/tags'
import WorkerNodeSkuField from '../../form-components/worker-node-sku'
import WorkerNodeSubnetField from '../../form-components/worker-node-subnet'
import AzureAvailabilityZoneFields from '../azure-availability-zone'
import AzureResourceGroupPicklist from '../AzureResourceGroupPicklist'
import AzureSkuPicklist from '../AzureSkuPicklist'
import AzureSubnetPicklist from '../AzureSubnetPicklist'
import AzureVnetPicklist from '../AzureVnetPicklist'
import Text from 'core/elements/text'
import { AddonTogglers } from '../../form-components/cluster-addon-manager'
import { azureClusterTracking } from '../../tracking'
import { ClusterCreateTypes } from '../../model'
import CustomApiFlags from '../../form-components/custom-api-flag'
import useScopedPreferences from 'core/session/useScopedPreferences'
import { isEmpty } from 'ramda'

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
  networkStack: 'ipv4',
  privileged: true,
  allowWorkloadsOnMaster: false,
}

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'location', label: 'Region' },
  { id: 'masterSku', label: 'Master node SKU', insertDivider: true },
  { id: 'workerSku', label: 'Worker node SKU' },
  { id: 'numMasters', label: 'Master nodes' },
  { id: 'numWorkers', label: 'Worker nodes' },
  {
    id: 'allowWorkloadsOnMaster',
    label: 'Make Master nodes Master + Worker',
    render: (value) => castBoolToStr()(value),
  },
  { id: 'enableCAS', label: 'Auto scaling', render: (value) => castBoolToStr()(value) },
  {
    id: 'assignPublicIps',
    label: "Assign public IP's",
    render: (value) => castBoolToStr()(value),
    insertDivider: true,
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
    renderArray: true,
    render: (value) => <FormattedTags tags={value} />,
  },
]

const trackingFields = {
  platform: CloudProviders.Azure,
  target: ClusterCreateTypes.Custom,
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
const handleTemplateChoice = ({ setFieldValue }) => (option) => {
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
  const [prefs] = useScopedPreferences('defaults')
  const cloudDefaults = useMemo(() => prefs[UserPreferences.Azure] || {}, [prefs])

  const [cloudProviderRegionDetails] = useDataLoader(loadCloudProviderRegionDetails, {
    cloudProviderId: wizardContext.cloudProviderId,
    cloudProviderRegionId: wizardContext.region,
  })
  const virtualNetworks = pathStrOr([], '0.virtualNetworks', cloudProviderRegionDetails)

  const handleRegionChange = (regionName) =>
    setWizardContext({ region: regionName, location: regionName })

  const handleCloudProviderChange = (value) => {
    setWizardContext({
      cloudProviderId: value,
    })

    // Populate the form with default values from the pref store AFTER the user chooses the
    // cloud provider. This is to maintain form order. Cloud provider ID is needed to populate the options
    // for the rest of the fields
    setCloudDefaults()
  }

  const setCloudDefaults = useCallback(() => {
    if (isEmpty(cloudDefaults)) return
    setWizardContext({ ...cloudDefaults, location: cloudDefaults[CloudDefaults.Region] })
  }, [cloudDefaults])

  return (
    <>
      {/* Step 1 - Cluster Configuration */}
      <WizardStep
        stepId="config"
        label="Initial Setup"
        onNext={azureClusterTracking.wZStepOne(trackingFields)}
      >
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
                <ClusterNameField setWizardContext={setWizardContext} />

                {/* Cloud Provider */}
                <CloudProviderField
                  cloudProviderType={CloudProviders.Azure}
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                  onChange={handleCloudProviderChange}
                />

                {/* Cloud Provider Region */}
                <CloudProviderRegionField
                  cloudProviderType={CloudProviders.Azure}
                  values={values}
                  wizardContext={wizardContext}
                  onChange={handleRegionChange}
                  disabled={!values.cloudProviderId && !values.region}
                />

                {/* SSH Key */}
                <SshKeyTextField
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                />

                {/* Template Chooser */}
                <ClusterTemplatesField
                  options={templateOptions}
                  onChange={handleTemplateChoice({
                    setFieldValue,
                  })}
                />

                {values.template === 'custom' && (
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
                  </>
                )}
              </FormFieldCard>

              <FormFieldCard title="Cluster Settings">
                {/* Kubernetes Version */}
                <KubernetesVersion />

                <Divider className={classes.divider} />

                {/* App & Container Settings */}
                <Text variant="caption1">Application & Container Settings</Text>

                {/* Allow workloads on masters */}
                <AllowWorkloadsOnMasterField setWizardContext={setWizardContext} />

                <PrivilegedField
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                />

                <Divider className={classes.divider} />

                {/* Managed Add-Ons */}
                <Text variant="caption1">Cluster Add-Ons</Text>
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
      <WizardStep
        stepId="network"
        label="Network Info"
        onNext={azureClusterTracking.wZStepTwo(trackingFields)}
      >
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
                    <ExistingNetworkField dropdownComponent={AzureVnetPicklist} values={values} />

                    {/* Master node subnet */}
                    <MasterNodeSubnetField
                      dropdownComponent={AzureSubnetPicklist}
                      values={values}
                    />

                    {/* Worker node subnet */}
                    <WorkerNodeSubnetField
                      dropdownComponent={AzureSubnetPicklist}
                      values={values}
                    />
                  </>
                )}

                {values.network === 'existing' && virtualNetworks.length === 0 && (
                  <Alert
                    small
                    variant="error"
                    message={`No existing virtual networks in location ${wizardContext.region}.`}
                  />
                )}

                {/* API FQDN */}
                <ApiFqdnField
                  setWizardContext={setWizardContext}
                  wizardContext={wizardContext}
                  required={false}
                />

                {/* Containers CIDR and Services CIDR */}
                <ContainerAndServicesCidrField values={values} />

                {/* HTTP proxy */}
                <HttpProxyField />
              </FormFieldCard>
            </>
          )}
        </ValidatedForm>
      </WizardStep>

      {/* Step 3 - Advanced Configuration */}
      <WizardStep
        stepId="advanced"
        label="Advanced Configuration"
        onNext={azureClusterTracking.wZStepThree(trackingFields)}
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
                <CustomApiFlags wizardContext={wizardContext} setWizardContext={setWizardContext} />
                <TagsField />
                <AddonTogglers
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                  addons={['enableTopologyManager']}
                />
              </FormFieldCard>
            </>
          )}
        </ValidatedForm>
      </WizardStep>

      {/* Step 4 - Review */}
      <WizardStep
        stepId="review"
        label="Review"
        onNext={azureClusterTracking.wZStepFour(trackingFields)}
      >
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

export default AdvancedAzureCluster
