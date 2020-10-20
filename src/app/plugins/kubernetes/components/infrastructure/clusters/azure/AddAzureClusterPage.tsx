/* eslint-disable max-len */
import React, { FC, useCallback, useEffect, useState } from 'react'
import FormWrapper from 'core/components/FormWrapper'
import AzureAvailabilityZoneChooser from './AzureAvailabilityZoneChooser'
import AzureClusterReviewTable from './AzureClusterReviewTable'
import AzureSkuPicklist from './AzureSkuPicklist'
import AzureSubnetPicklist from './AzureSubnetPicklist'
import AzureVnetPicklist from './AzureVnetPicklist'
import AzureResourceGroupPicklist from './AzureResourceGroupPicklist'
import CloudProviderPicklist from 'k8s/components/common/CloudProviderPicklist'
import CloudProviderRegionPicklist from 'k8s/components/common/CloudProviderRegionPicklist'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import KeyValuesField from 'core/components/validatedForm/KeyValuesField'
import PicklistField from 'core/components/validatedForm/PicklistField'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import useDataUpdater from 'core/hooks/useDataUpdater'
import useParams from 'core/hooks/useParams'
import useReactRouter from 'use-react-router'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import { runtimePrivilegedLink } from 'k8s/links'
import { pathJoin } from 'utils/misc'
import { defaultEtcBackupPath, k8sPrefix } from 'app/constants'
import ExternalLink from 'core/components/ExternalLink'
import CodeBlock from 'core/components/CodeBlock'
import { cloudProviderActions, loadCloudProviderDetails } from '../../cloudProviders/actions'
import useDataLoader from 'core/hooks/useDataLoader'
import { PromptToAddProvider } from '../../cloudProviders/PromptToAddProvider'
import { CloudProviders } from '../../cloudProviders/model'
import EtcdBackupFields from '../EtcdBackupFields'
import { makeStyles } from '@material-ui/styles'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { routes } from 'core/utils/routes'
import Alert from 'core/components/Alert'
import { trackEvent } from 'utils/tracking'
import { customValidator } from 'core/utils/fieldValidators'
import { isKeyValid } from 'ssh-pub-key-validation'
import { loadCloudProviderRegionDetails } from 'k8s/components/infrastructure/cloudProviders/actions'
import { pathStrOr } from 'utils/fp'
import { ClusterCreateTypes } from '../model'
import Theme from 'core/themes/model'
import WizardMeta from 'core/components/wizard/WizardMeta'
import { getFormTitle } from '../helpers'

const listUrl = pathJoin(k8sPrefix, 'infrastructure')

const sshKeyValidator = customValidator((value, formValues) => {
  return isKeyValid(value)
}, 'You must enter a valid SSH key')

const useStyles = makeStyles<Theme>((theme) => ({
  tableWidth: {
    maxWidth: 560,
  },
  inline: {
    display: 'grid',
  },
  availability: {
    maxWidth: '50%',
    margin: theme.spacing(1.5, 0),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}))

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

const initialContext = {
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

const templateOptions = [
  { label: 'Sm - Single Node Master & Worker (Standard_A1_v2)', value: 'small' },
  { label: 'Md - 1 Master + 3 Workers (Standard_A2_v2)', value: 'medium' },
  { label: 'Lg - 3 Masters + 5 Workers (Standard_A4_v2)', value: 'large' },
  { label: 'custom', value: 'custom' },
]

const numMasterOptions = [
  { label: '1', value: 1 },
  { label: '3', value: 3 },
  { label: '5', value: 5 },
]

const runtimeConfigOptions = [
  { label: 'Default API groups and versions', value: 'default' },
  { label: 'All API groups and versions', value: 'all' },
  { label: 'Custom', value: 'custom' },
]

// The template picker allows the user to fill out some useful defaults for the fields.
// This greatly simplifies the number of fields that need to be filled out.
// Presets are as follows:
// small (single dev) - 1 node master + worker - select instance type (default t2.small)
// medium (internal team) - 1 master + 3 workers - select instance (default t2.medium)
// large (production) - 3 master + 5 workers - no workload on masters (default t2.large)
const handleTemplateChoice = ({ setWizardContext, setFieldValue, paramUpdater }) => (option) => {
  const options = {
    small: {
      numMasters: 1,
      numWorkers: 0,
      allowWorkloadsOnMaster: true,
      masterFlavor: 'Standard_A1_v2',
      workerFlavor: 'Standard_A1_v2',
    },
    medium: {
      numMasters: 1,
      numWorkers: 3,
      allowWorkloadsOnMaster: false,
      masterFlavor: 'Standard_A2_v2',
      workerFlavor: 'Standard_A2_v2',
    },
    large: {
      numMasters: 3,
      numWorkers: 5,
      allowWorkloadsOnMaster: false,
      masterFlavor: 'Standard_A4_v2',
      workerFlavor: 'Standard_A4_v2',
    },
    custom: {
      numMasters: 3,
      numWorkers: 5,
      allowWorkloadsOnMaster: false,
      masterFlavor: 'Standard_A4_v2',
      workerFlavor: 'Standard_A4_v2',
    },
  }

  paramUpdater(option)

  // setImmediate is used because we need the fields to show up in the form before their values can be set
  setImmediate(() => {
    setWizardContext(options[option])
    Object.entries(options[option]).forEach(([key, value]) => {
      setFieldValue(key)(value)
    })
  })
}

const networkOptions = [
  { label: 'Select existing', value: 'existing' },
  { label: 'Create new network', value: 'newNetwork' },
]

const AddAzureClusterPage = () => {
  const classes = useStyles()
  const { params, updateParams, getParamsUpdater } = useParams()
  const { history, match } = useReactRouter()
  const createType = match?.params?.type || ClusterCreateTypes.Custom
  const [activeView, setActiveView] = useState<{ ViewComponent: FC<any> }>(null)
  const [formTitle, setFormTitle] = useState<string>('')

  useEffect(() => {
    async function loadFile(name) {
      const view = await import(`./create-templates/${name}`)
      setActiveView({ ViewComponent: view.default })
      setFormTitle(view.templateTitle)
    }
    loadFile(createType)
  }, [createType])

  useEffect(() => {
    trackEvent('WZ New Azure Cluster 0 Started', {
      wizard_step: 'Start',
      wizard_state: 'Started',
      wizard_progress: '0 of 4',
      wizard_name: 'Add New Azure Cluster',
    })
  }, [])

  const onComplete = (_, { uuid }) => history.push(routes.cluster.nodeHealth.path({ id: uuid }))
  const [createAzureClusterAction, creatingAzureCluster] = useDataUpdater(
    clusterActions.create,
    onComplete,
  )
  const handleSubmit = (params) => (data) => {
    data.location = params.cloudProviderRegionId
    createAzureClusterAction({ ...data, ...params, clusterType: CloudProviders.Azure })
  }

  const [cloudProviders, loading] = useDataLoader(cloudProviderActions.list)
  const hasAzureProvider = !!cloudProviders.some(
    (provider) => provider.type === CloudProviders.Azure,
  )

  const [cloudProviderDetails] = useDataLoader(loadCloudProviderDetails, {
    cloudProviderId: params.cloudProviderId,
  })

  const [cloudProviderRegionDetails] = useDataLoader(loadCloudProviderRegionDetails, {
    cloudProviderId: params.cloudProviderId,
    cloudProviderRegionId: params.cloudProviderRegionId,
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
      updateParams({ cloudProviderRegionId: regionName })
    },
    [cloudProviderDetails],
  )
  const ViewComponent = activeView?.ViewComponent
  return (
    <FormWrapper
      title={getFormTitle(formTitle, createType)}
      backUrl={listUrl}
      loading={creatingAzureCluster || loading}
      message={loading ? 'loading...' : 'Submitting form...'}
    >
      <Wizard
        disableNext={!hasAzureProvider}
        onComplete={handleSubmit(params)}
        context={initialContext}
        originPath={routes.cluster.add.path()}
        showFinishAndReviewButton
      >
        {({ wizardContext, setWizardContext, onNext }) => {
          return (
            <WizardMeta fields={wizardContext}>
              {ViewComponent && <ViewComponent />}
              {!!false && (
                <>
                  <WizardStep stepId="config" label="Cluster Configuration" onNext={configOnNext}>
                    {loading ? null : hasAzureProvider ? (
                      <ValidatedForm
                        initialValues={wizardContext}
                        onSubmit={setWizardContext}
                        triggerSubmit={onNext}
                        title="Configure Your Cluster"
                      >
                        {({ setFieldValue, values }) => (
                          <>
                            {/* Cluster Name */}
                            <TextField id="name" label="Name" info="Name of the cluster" required />

                            {/* Cloud Provider */}
                            <PicklistField
                              DropdownComponent={CloudProviderPicklist}
                              id="cloudProviderId"
                              label="Cloud Provider"
                              onChange={getParamsUpdater('cloudProviderId')}
                              info="Nodes will be provisioned using this cloud provider."
                              value={params.cloudProviderId}
                              type="azure"
                              required
                            />

                            {/* Azure Region */}
                            <PicklistField
                              DropdownComponent={CloudProviderRegionPicklist}
                              disabled={!params.cloudProviderId}
                              id="location"
                              label="Region"
                              cloudProviderId={params.cloudProviderId}
                              onChange={handleRegionChange}
                              type="azure"
                              required
                            />

                            {/* SSH Key */}
                            <TextField
                              id="sshKey"
                              label="Public SSH key"
                              info="Copy/paste your SSH public key"
                              size="small"
                              validations={[sshKeyValidator]}
                              multiline
                              rows={3}
                              required
                            />

                            {/* Template Chooser */}
                            <PicklistField
                              id="template"
                              label="Cluster Template"
                              options={templateOptions}
                              onChange={handleTemplateChoice({
                                setWizardContext,
                                setFieldValue,
                                paramUpdater: getParamsUpdater('template'),
                              })}
                            />

                            {params.template !== 'custom' && (
                              <CheckboxField
                                id="allowWorkloadsOnMaster"
                                value={wizardContext.allowWorkloadsOnMaster}
                                label="Enable workloads on all master nodes"
                                info="It is highly recommended to not enable workloads on master nodes for production or critical workload clusters."
                                disabled
                              />
                            )}

                            {params.template === 'custom' && (
                              <>
                                <CheckboxField
                                  id="useAllAvailabilityZones"
                                  label="Use all availability zones"
                                  onChange={(value) =>
                                    setWizardContext({ useAllAvailabilityZones: value, zones: [] })
                                  }
                                  value={
                                    !params.cloudProviderRegionId
                                      ? false
                                      : wizardContext.useAllAvailabilityZones
                                  }
                                  info=""
                                  disabled={!params.cloudProviderRegionId}
                                />

                                {/* Azure Availability Zone */}
                                {!params.cloudProviderRegionId || values.useAllAvailabilityZones || (
                                  <div className={classes.availability}>
                                    <AzureAvailabilityZoneChooser
                                      id="zones"
                                      info="Select from the Availability Zones for the specified region"
                                      onChange={(value) => setWizardContext({ zones: value })}
                                      required
                                    />
                                  </div>
                                )}

                                {/* Num master nodes */}
                                <PicklistField
                                  id="numMasters"
                                  options={numMasterOptions}
                                  label="Master nodes"
                                  info="Number of master nodes to deploy.  3 nodes are required for an High Availability (HA) cluster."
                                  required
                                />
                                {/* Master node SKU */}
                                <PicklistField
                                  DropdownComponent={AzureSkuPicklist}
                                  disabled={
                                    !(params.cloudProviderId && params.cloudProviderRegionId)
                                  }
                                  id="masterSku"
                                  label="Master Node SKU"
                                  cloudProviderId={params.cloudProviderId}
                                  cloudProviderRegionId={params.cloudProviderRegionId}
                                  filterByZones={!wizardContext.useAllAvailabilityZones}
                                  selectedZones={wizardContext.zones}
                                  info="Choose an instance type used by master nodes."
                                  required
                                />

                                {/* Num worker nodes */}
                                <TextField
                                  id="numWorkers"
                                  type="number"
                                  label="Worker nodes"
                                  info="Number of worker nodes to deploy."
                                  required
                                />

                                {/* Worker node SKU */}
                                <PicklistField
                                  DropdownComponent={AzureSkuPicklist}
                                  disabled={
                                    !(params.cloudProviderId && params.cloudProviderRegionId)
                                  }
                                  id="workerSku"
                                  label="Worker Node SKU"
                                  cloudProviderId={params.cloudProviderId}
                                  cloudProviderRegionId={params.cloudProviderRegionId}
                                  filterByZones={!values.useAllAvailabilityZones}
                                  selectedZones={params.zones}
                                  info="Choose an instance type used by worker nodes."
                                  required
                                />

                                {/* Allow workloads on masters */}
                                <CheckboxField
                                  id="allowWorkloadsOnMaster"
                                  label="Enable workloads on all master nodes"
                                  info="It is highly recommended to not enable workloads on master nodes for production or critical workload clusters."
                                />

                                {/* Enable Auto Scaling */}
                                <CheckboxField
                                  id="enableCAS"
                                  label="Enable Auto Scaling"
                                  info="The cluster may scale up to the max worker nodes specified. Auto scaling may not be used with spot instances."
                                />

                                {/* Max num worker nodes (autoscaling) */}
                                {values.enableCAS && (
                                  <TextField
                                    id="numMaxWorkers"
                                    type="number"
                                    label="Maximum number of worker nodes"
                                    info="Maximum number of worker nodes this cluster may be scaled up to."
                                    required={values.enableCAS}
                                  />
                                )}
                              </>
                            )}
                          </>
                        )}
                      </ValidatedForm>
                    ) : (
                      <FormFieldCard title="Create Azure Cloud Provider">
                        <PromptToAddProvider
                          type={CloudProviders.Azure}
                          src={routes.cloudProviders.add.path({ type: CloudProviders.Azure })}
                        />
                      </FormFieldCard>
                    )}
                  </WizardStep>

                  <WizardStep stepId="network" label="Network Info" onNext={networkOnNext}>
                    <ValidatedForm
                      initialValues={wizardContext}
                      onSubmit={setWizardContext}
                      triggerSubmit={onNext}
                      title="Networking Details"
                    >
                      {({ setFieldValue, values }) => (
                        <>
                          {/* Assign public IP's */}
                          <CheckboxField
                            id="assignPublicIps"
                            label="Assign public IP's"
                            info="Assign a public IP for every node created on this cluster."
                          />

                          {/* Network */}
                          <PicklistField
                            id="network"
                            options={networkOptions}
                            label="Network"
                            info="Select existing networking resources or automatically create and assign new networking resources."
                            required
                          />

                          {values.network === 'existing' && virtualNetworks.length > 0 && (
                            <>
                              {/* Resource group */}
                              <PicklistField
                                DropdownComponent={AzureResourceGroupPicklist}
                                disabled={!(params.cloudProviderId && params.cloudProviderRegionId)}
                                id="vnetResourceGroup"
                                label="Resource group"
                                cloudProviderId={params.cloudProviderId}
                                cloudProviderRegionId={params.cloudProviderRegionId}
                                onChange={getParamsUpdater('resourceGroup')}
                                info="Select the resource group that your networking resources belong to."
                                required
                              />

                              {/* Existing network.  I don't get the point of this field. */}
                              <PicklistField
                                DropdownComponent={AzureVnetPicklist}
                                disabled={!(params.cloudProviderId && params.cloudProviderRegionId)}
                                id="vnetName"
                                label="Select existing network"
                                cloudProviderId={params.cloudProviderId}
                                cloudProviderRegionId={params.cloudProviderRegionId}
                                resourceGroup={params.resourceGroup}
                                info="Select the network for your cluster."
                                required
                              />

                              {/* Master node subnet */}
                              <PicklistField
                                DropdownComponent={AzureSubnetPicklist}
                                disabled={!(params.cloudProviderId && params.cloudProviderRegionId)}
                                id="masterSubnetName"
                                label="Master node subnet"
                                cloudProviderId={params.cloudProviderId}
                                cloudProviderRegionId={params.cloudProviderRegionId}
                                resourceGroup={params.resourceGroup}
                                info="Select the subnet for your master nodes. Can be the same as worker node subnet."
                                required
                              />

                              {/* Worker node subnet */}
                              <PicklistField
                                DropdownComponent={AzureSubnetPicklist}
                                disabled={!(params.cloudProviderId && params.cloudProviderRegionId)}
                                id="workerSubnetName"
                                label="Worker node subnet"
                                cloudProviderId={params.cloudProviderId}
                                cloudProviderRegionId={params.cloudProviderRegionId}
                                resourceGroup={params.resourceGroup}
                                info="Select the subnet for your worker nodes. Can be the same as master node subnet."
                                required
                              />
                            </>
                          )}

                          {values.network === 'existing' && virtualNetworks.length === 0 && (
                            <Alert
                              small
                              variant="error"
                              message={`No existing virtual networks in location ${params.cloudProviderRegionId}.`}
                            />
                          )}

                          {/* API FQDN */}
                          <TextField
                            id="externalDnsName"
                            label="API FQDN"
                            info="Fully Qualified Domain Name used to reference the cluster API. The API will be secured by including the FQDN in the API server certificate’s Subject Alt Names. Clusters in Public Cloud will automatically have the DNS records created and registered for the FQDN."
                          />

                          {/* Containers CIDR */}
                          <TextField
                            id="containersCidr"
                            label="Containers CIDR"
                            info="Network CIDR from which Kubernetes allocates IP addresses to containers. This CIDR shouldn't overlap with the VPC CIDR. A /16 CIDR enables 256 nodes."
                            required
                          />

                          {/* Services CIDR */}
                          <TextField
                            id="servicesCidr"
                            label="Services CIDR"
                            info="The network CIDR for Kubernetes virtual IP addresses for Services. This CIDR shouldn't overlap with the VPC CIDR."
                            required
                          />

                          {/* HTTP proxy */}
                          <TextField
                            id="httpProxy"
                            label="HTTP Proxy"
                            infoPlacement="right-end"
                            info={
                              <div className={classes.inline}>
                                Specify the HTTP proxy for this cluster. Format{' '}
                                <CodeBlock>
                                  <span>{'<scheme>://<username>:<password>@<host>:<port>'}</span>
                                </CodeBlock>{' '}
                                username and password are optional.
                              </div>
                            }
                          />
                        </>
                      )}
                    </ValidatedForm>
                  </WizardStep>

                  <WizardStep
                    stepId="advanced"
                    label="Advanced Configuration"
                    onNext={advancedOnNext}
                  >
                    <ValidatedForm
                      initialValues={wizardContext}
                      onSubmit={setWizardContext}
                      triggerSubmit={onNext}
                      title="Final Tweaks"
                    >
                      {({ setFieldValue, values }) => (
                        <>
                          {/* Privileged */}
                          <CheckboxField
                            id="privileged"
                            label="Privileged"
                            disabled={['calico', 'canal', 'weave'].includes(values.networkPlugin)}
                            info={
                              <div>
                                Allows this cluster to run privileged containers. Read{' '}
                                <ExternalLink url={runtimePrivilegedLink}>
                                  this article
                                </ExternalLink>{' '}
                                for more information. This is required for Calico CNI and CSI.
                              </div>
                            }
                          />

                          {/* Etcd Backup */}
                          <CheckboxField
                            id="etcdBackup"
                            label="Enable etcd Backup"
                            info="Enable automated etcd backups on this cluster"
                          />

                          {values.etcdBackup && <EtcdBackupFields />}

                          {/* Prometheus monitoring */}
                          <CheckboxField
                            id="prometheusMonitoringEnabled"
                            label="Enable monitoring with prometheus"
                            info="This deploys an instance of prometheus on the cluster."
                          />

                          {!values.prometheusMonitoringEnabled && (
                            <Alert
                              small
                              variant="error"
                              message="The PMK management plane will not be able to monitor the cluster health."
                            />
                          )}

                          {/* Advanced API Configuration */}
                          <PicklistField
                            id="runtimeConfigOption"
                            label="Advanced API Configuration"
                            options={runtimeConfigOptions}
                            info="Make sure you are familiar with the Kubernetes API configuration documentation before enabling this option."
                            required
                          />

                          {values.runtimeConfigOption === 'custom' && (
                            <TextField
                              id="customRuntimeConfig"
                              label="Custom API Configuration"
                              info=""
                            />
                          )}

                          {/* Enable Application Catalog */}
                          {/* <CheckboxField
          id="appCatalogEnabled"
          label="Enable Application Catalog"
          info="Enable the Helm Application Catalog on this cluster"
        /> */}

                          {/* Tags */}
                          <KeyValuesField
                            id="tags"
                            label="Tags"
                            info="Add tag metadata to this cluster"
                          />
                        </>
                      )}
                    </ValidatedForm>
                  </WizardStep>

                  <WizardStep stepId="review" label="Review" onNext={reviewOnNext}>
                    <ValidatedForm
                      initialValues={wizardContext}
                      onSubmit={setWizardContext}
                      triggerSubmit={onNext}
                      title="Finish and Review"
                    >
                      <AzureClusterReviewTable data={wizardContext} />
                    </ValidatedForm>
                  </WizardStep>
                </>
              )}
            </WizardMeta>
          )
        }}
      </Wizard>
    </FormWrapper>
  )
}

export default AddAzureClusterPage
