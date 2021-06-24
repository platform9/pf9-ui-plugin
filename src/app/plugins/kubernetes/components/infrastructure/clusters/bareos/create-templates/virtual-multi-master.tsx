/* eslint-disable max-len */
import React, { FC } from 'react'
import { makeStyles } from '@material-ui/styles'
import { allPass } from 'ramda'

import { pmkCliOverviewLink } from 'k8s/links'
import { defaultEtcBackupPath } from 'app/constants'
import { capitalizeString, castBoolToStr } from 'utils/misc'

import ExternalLink from 'core/components/ExternalLink'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import WizardStep from 'core/components/wizard/WizardStep'

import ClusterNameField from '../../form-components/name'
import KubernetesVersion from '../../form-components/kubernetes-version'

import Theme from 'core/themes/model'
import { Divider } from '@material-ui/core'
import Text from 'core/elements/text'
import NetworkStack from '../../form-components/network-stack'
import PrivilegedContainers from '../../form-components/privileged'
import AllowWorkloadsOnMaster from '../../form-components/allow-workloads-on-master'
import { AddonTogglers } from '../../form-components/cluster-addon-manager'
import AdvancedApiConfigFields from '../../form-components/advanced-api-config'
import ClusterHostChooser, {
  isConnected,
  isUnassignedNode,
  excludeNodes,
} from '../ClusterHostChooser'
import { masterNodeLengthValidator, requiredValidator } from 'core/utils/fieldValidators'
import ApiFQDNField from '../../form-components/external-dns-name'
import ContainerAndServicesCIDRField from '../../form-components/container-and-services-cidr'
import HttpProxyField from '../../form-components/http-proxy'
import NetworkBackendField, { NetworkBackendTypes } from '../../form-components/network-backend'
import CalicoNetworkFields, {
  CalicoDetectionTypes,
} from '../../form-components/calico-network-fields'
import TagsField, { FormattedTags } from '../../form-components/tags'
import MasterVipFields from '../../form-components/master-virtual-ip'
import BareOsClusterReviewTable from '../BareOsClusterReviewTable'
import { ClusterCreateTypeNames, ClusterCreateTypes } from '../../model'
import { CloudProviders } from 'k8s/components/infrastructure/cloudProviders/model'
import { bareOSClusterTracking } from '../../tracking'
import CustomApiFlags from '../../form-components/custom-api-flag'
import NodeRegistrationChooser from '../../form-components/node-registration-chooser'
export const initialContext = {
  containersCidr: '10.20.0.0/16',
  servicesCidr: '10.21.0.0/16',
  networkPlugin: 'calico',
  calicoIpIpMode: 'Always',
  calicoNatOutgoing: true,
  calicoBlockSize: '26',
  runtimeConfigOption: 'default',
  mtuSize: 1440,
  privileged: true,
  etcdBackup: true,
  etcdStoragePath: defaultEtcBackupPath,
  etcdBackupInterval: 1440,
  prometheusMonitoringEnabled: true,
  allowWorkloadsOnMaster: true,
  tags: [],
  appCatalogEnabled: false,
  networkStack: 'ipv4',
  calicoIPv4: 'autodetect',
  calicoIPv6: 'none',
  calicoDetectionMethod: CalicoDetectionTypes.FirstFound,
  useHostname: false,
  nodeRegistrationType: 'ipAddress',
}

interface Props {
  wizardContext: any
  setWizardContext: any
  onNext: any
}

const clusterAddons = [
  'etcdBackup',
  'enableMetallbLayer2',
  'prometheusMonitoringEnabled',
  'networkPluginOperator',
  'kubevirtPluginOperator',
]
const trackingFields = {
  platform: CloudProviders.VirtualMachine,
  target: ClusterCreateTypes.MultiMaster,
}

const VirtualMultiMasterCluster: FC<Props> = ({ onNext, ...props }) => {
  const { wizardContext, setWizardContext } = props
  const classes = useStyles({})
  return (
    <>
      <WizardStep
        stepId="basic"
        label="Initial Setup"
        onNext={bareOSClusterTracking.wZStepOne(trackingFields)}
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
              {/* Cluster Name */}
              <FormFieldCard
                title={`Name your ${
                  ClusterCreateTypeNames[ClusterCreateTypes.MultiMaster]
                } Cluster`}
                link={
                  <ExternalLink textVariant="caption2" url={pmkCliOverviewLink}>
                    BareOS Cluster Help
                  </ExternalLink>
                }
              >
                <ClusterNameField setWizardContext={setWizardContext} />
              </FormFieldCard>

              {/* Cluster Settings */}
              <FormFieldCard title="Cluster Settings">
                <KubernetesVersion
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                />

                <Divider className={classes.divider} />
                <Text variant="caption1">Cluster Network Stack</Text>
                <NetworkStack {...props} />

                <Divider className={classes.divider} />
                <Text variant="caption1">Node Registration</Text>
                <NodeRegistrationChooser
                  values={values}
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                />

                <Divider className={classes.divider} />
                <Text variant="caption1">Application & Container Settings</Text>
                <PrivilegedContainers {...props} />
                <AllowWorkloadsOnMaster setWizardContext={setWizardContext} />

                <Divider className={classes.divider} />
                <Text variant="caption1">Cluster Add-Ons</Text>
                <AddonTogglers
                  addons={clusterAddons}
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                />
              </FormFieldCard>
            </>
          )}
        </ValidatedForm>
      </WizardStep>
      <WizardStep
        stepId="masters"
        label="Master Nodes"
        onNext={bareOSClusterTracking.wZStepTwo(trackingFields)}
      >
        <ValidatedForm
          fullWidth
          initialValues={wizardContext}
          onSubmit={setWizardContext}
          triggerSubmit={onNext}
          title="Select nodes to add as Master Nodes"
          link={
            <ExternalLink textVariant="caption2" url={pmkCliOverviewLink}>
              Not Seeing Any Nodes?
            </ExternalLink>
          }
        >
          <ClusterHostChooser
            selection="multiple"
            id="masterNodes"
            filterFn={allPass([isConnected, isUnassignedNode])}
            validations={[masterNodeLengthValidator]}
            pollForNodes
            required
          />
        </ValidatedForm>
      </WizardStep>
      <WizardStep
        stepId="workers"
        label="Worker Nodes"
        onNext={bareOSClusterTracking.wZStepThree(trackingFields)}
      >
        <ValidatedForm
          fullWidth
          initialValues={wizardContext}
          onSubmit={setWizardContext}
          triggerSubmit={onNext}
          title="Select nodes to add as Worker Nodes"
          link={
            <ExternalLink textVariant="caption2" url={pmkCliOverviewLink}>
              Not Seeing Any Nodes?
            </ExternalLink>
          }
        >
          <ClusterHostChooser
            selection="multiple"
            id="workerNodes"
            filterFn={allPass([
              isUnassignedNode,
              isConnected,
              excludeNodes(wizardContext.masterNodes),
            ])}
            pollForNodes
            validations={wizardContext.allowWorkloadsOnMaster ? null : [requiredValidator]}
          />
        </ValidatedForm>
      </WizardStep>
      <WizardStep
        stepId="network"
        label="Network"
        onNext={bareOSClusterTracking.wZStepFour(trackingFields)}
      >
        <ValidatedForm
          initialValues={wizardContext}
          onSubmit={setWizardContext}
          triggerSubmit={onNext}
          classes={{ root: classes.validatedFormContainer }}
          elevated={false}
        >
          {({ values }) => (
            <>
              <FormFieldCard title="Cluster API FQDN">
                <ApiFQDNField />
              </FormFieldCard>

              <FormFieldCard title="Cluster Virtual IP Configuration">
                <MasterVipFields withInfo wizardContext={wizardContext} />
              </FormFieldCard>

              <FormFieldCard title="Cluster Networking Range & HTTP Proxy">
                <ContainerAndServicesCIDRField values={values} />
                <HttpProxyField />
              </FormFieldCard>

              <FormFieldCard title="Cluster CNI">
                <NetworkBackendField
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                />
                {values.networkPlugin === NetworkBackendTypes.Calico && (
                  <CalicoNetworkFields values={wizardContext} setValues={setWizardContext} />
                )}
              </FormFieldCard>
            </>
          )}
        </ValidatedForm>
      </WizardStep>
      <WizardStep
        stepId="advanced"
        label="Advanced"
        onNext={bareOSClusterTracking.wZStepFive(trackingFields)}
      >
        <ValidatedForm
          fullWidth
          classes={{ root: classes.validatedFormContainer }}
          initialValues={wizardContext}
          onSubmit={setWizardContext}
          triggerSubmit={onNext}
          elevated={false}
          withAddonManager
        >
          {({ values }) => (
            <>
              <FormFieldCard title="Advanced Configuration">
                <AdvancedApiConfigFields values={values} />
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
      <WizardStep
        stepId="review"
        label="Finalize & Review"
        onNext={bareOSClusterTracking.wZStepSix(trackingFields)}
      >
        <ValidatedForm
          initialValues={wizardContext}
          onSubmit={setWizardContext}
          triggerSubmit={onNext}
          title="Finish and Review"
        >
          <BareOsClusterReviewTable wizardContext={wizardContext} columns={reviewTableColumns} />
        </ValidatedForm>
      </WizardStep>
    </>
  )
}

export default VirtualMultiMasterCluster

const reviewTableColumns = [
  { id: 'name', label: 'Cluster Name' },
  { id: 'kubeRoleVersion', label: 'Kubernetes Version', insertDivider: true },
  { id: 'masterNodes', label: 'Master Nodes' },
  { id: 'workerNodes', label: 'Worker Nodes' },
  { id: 'masterVipIpv4', label: 'Virtual IP address for cluster' },
  { id: 'masterVipIface', label: 'Physical interface for virtual IP association' },
  { id: 'externalDnsName', label: 'API FQDN', insertDivider: true },
  { id: 'containersCidr', label: 'Containers CIDR' },
  { id: 'servicesCidr', label: 'Services CIDR' },
  { id: 'enableMetallb', label: 'MetalLb', render: (value) => castBoolToStr()(value) },
  {
    id: 'networkPlugin',
    label: 'CNI',
    render: (value) => capitalizeString(value),
    insertDivider: true,
  },
  { id: 'calicoIpIpMode', label: 'IP in IP Encapsulation Mode' },
  { id: 'calicoNatOutgoing', label: 'NAT Outgoing', render: (value) => castBoolToStr()(value) },
  { id: 'calicoBlockSize', label: 'Block Size' },
  { id: 'mtuSize', label: 'MTU Size' },
  {
    id: 'privileged',
    label: 'Privileged',
    render: (value) => castBoolToStr()(value),
    insertDivider: true,
  },
  {
    id: 'allowWorkloadsOnMaster',
    label: 'Enable workloads on master node',
    render: (value) => castBoolToStr()(value),
  },
  {
    id: 'prometheusMonitoringEnabled',
    label: 'Prometheus Monitoring',
    render: (value) => castBoolToStr()(value),
  },
  {
    id: 'runtimeConfigOption',
    label: 'Advanced API Configuration',
    render: (value) => capitalizeString(value),
  },
  {
    id: 'tags',
    label: 'Tags',
    renderArray: true,
    render: (value) => <FormattedTags tags={value} />,
  },
]

const useStyles = makeStyles<Theme>((theme) => ({
  validatedFormContainer: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
  divider: {
    margin: theme.spacing(3, 0),
  },
}))
