import React, { FC, useCallback, useMemo } from 'react'
import { defaultEtcBackupPath, UserPreferences } from 'app/constants'
import WizardStep from 'core/components/wizard/WizardStep'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import ExternalLink from 'core/components/ExternalLink'
import { awsPrerequisitesLink } from 'k8s/links'
import { CloudDefaults, CloudProviders } from 'k8s/components/infrastructure/cloudProviders/model'
import ClusterNameField from '../../form-components/name'
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
import { ClusterCreateTypes } from '../../model'
import { awsClusterTracking } from '../../tracking'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import CustomApiFlags from '../../form-components/custom-api-flag'
import useScopedPreferences from 'core/session/useScopedPreferences'
import { isEmpty } from 'ramda'

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
  networkStack: 'ipv4',
  privileged: true,
  allowWorkloadsOnMaster: false,
  useRoute53: false,
  domainId: '',
  azs: [],
  enableProfileAgent: false,
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

const trackingFields = {
  platform: CloudProviders.Aws,
  target: ClusterCreateTypes.Custom,
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
const handleTemplateChoice = ({ setFieldValue, setWizardContext }) => (option) => {
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
  setWizardContext(options[option])
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

const configStepAddOns = ['etcdBackup', 'prometheusMonitoringEnabled', 'enableCAS', 'profileAgent']

interface Props {
  wizardContext: any
  setWizardContext: any
  onNext: any
}

const AdvancedAwsCluster: FC<Props> = ({ wizardContext, setWizardContext, onNext }) => {
  const classes = useStyles()
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
      // if (isEmpty(cloudDefaults)) return
      // setWizardContext({ ...cloudDefaults })
      if (isEmpty(cloudDefaults)) return
      setWizardContext({ ...cloudDefaults, domainId: cloudDefaults[CloudDefaults.DomainLabel] })
      updateFqdns(values)(
        cloudDefaults[CloudDefaults.Domain],
        cloudDefaults[CloudDefaults.DomainLabel],
      )
    },
    [cloudDefaults],
  )

  const handleStepOneSubmit = (values) => {
    setWizardContext(values)
    if (!values.useRoute53) {
      setWizardContext({ domainId: '', externalDnsName: '', serviceFqdn: '' })
    }
  }

  return (
    <>
      {/* Step 1 - Cluster Configuration */}
      <WizardStep
        stepId="config"
        label="Initial Setup"
        onNext={awsClusterTracking.wZStepOne(trackingFields)}
      >
        <ValidatedForm
          fullWidth
          classes={{ root: classes.validatedFormContainer }}
          initialValues={wizardContext}
          // onSubmit={setWizardContext}
          onSubmit={handleStepOneSubmit}
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
                <CloudProviderField
                  cloudProviderType={CloudProviders.Aws}
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                  onChange={handleCloudProviderChange(values)}
                />

                {/* AWS Region */}
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
                    allowMultiSelect
                  />
                )}

                {/* SSH Key */}
                <SshKeyField
                  dropdownComponent={AwsClusterSshKeyPicklist}
                  values={values}
                  // value={wizardContext.sshKey}
                  // onChange={(value) => setWizardContext({ sshKey: value })}
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                />

                {/* Template Chooser */}
                <ClusterTemplatesField
                  options={templateOptions}
                  onChange={handleTemplateChoice({
                    setFieldValue,
                    setWizardContext,
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
                <KubernetesVersion
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                />

                <CheckboxField
                  id="useRoute53"
                  label="Use Route53 for Cluster Access"
                  value={wizardContext.useRoute53}
                  info="Enable Platform9 to use a selected  Route53 domain for the  API Server and Service Endpoints."
                  onChange={(value) => setWizardContext({ useRoute53: value })}
                />

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
                  addons={configStepAddOns}
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
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
        onNext={awsClusterTracking.wZStepTwo(trackingFields)}
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

                {wizardContext.useRoute53 && (
                  <>
                    {/* API FQDN */}
                    <ApiFqdnField
                      setWizardContext={setWizardContext}
                      wizardContext={wizardContext}
                      required={false}
                      disabled={wizardContext.usePf9Domain}
                    />

                    {/* Services FQDN */}
                    <ServicesFqdnField
                      setWizardContext={setWizardContext}
                      wizardContext={wizardContext}
                      required={!wizardContext.usePf9Domain}
                      disabled={wizardContext.usePf9Domain}
                    />
                  </>
                )}
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
                {values.networkPlugin === 'calico' && (
                  <CalicoNetworkFields values={wizardContext} setValues={setWizardContext} />
                )}
              </FormFieldCard>
            </>
          )}
        </ValidatedForm>
      </WizardStep>

      {/* Step 3 - Advanced Configuration */}
      <WizardStep
        stepId="advanced"
        label="Advanced Configuration"
        onNext={awsClusterTracking.wZStepThree(trackingFields)}
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
        onNext={awsClusterTracking.wZStepFour(trackingFields)}
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

export default AdvancedAwsCluster
