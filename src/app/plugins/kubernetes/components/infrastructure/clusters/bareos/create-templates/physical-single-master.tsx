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
import { trackEvent } from 'utils/tracking'
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
import CalicoNetworkFields from '../../form-components/calico-network-fields'
import TagsField, { FormattedTags } from '../../form-components/tags'
import BareOsClusterReviewTable from '../BareOsClusterReviewTable'

export const templateTitle = 'Single Master'

export const initialContext = {
  containersCidr: '10.20.0.0/16',
  servicesCidr: '10.21.0.0/16',
  networkPlugin: 'calico',
  calicoIpIpMode: 'Always',
  calicoNatOutgoing: true,
  calicoV4BlockSize: '24',
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
  kubernetesVersion: 'v1.19',
  networkStack: 'ipv4',
}

interface Props {
  wizardContext: any
  setWizardContext: any
  onNext: any
}

const PhysicalSingleMasterCluster: FC<Props> = ({ onNext, ...props }) => {
  const { wizardContext, setWizardContext } = props
  const classes = useStyles({})
  return (
    <>
      <WizardStep stepId="basic" label="Initial Setup" onNext={basicOnNext}>
        <ValidatedForm
          fullWidth
          classes={{ root: classes.validatedFormContainer }}
          initialValues={wizardContext}
          onSubmit={setWizardContext}
          triggerSubmit={onNext}
          withAddonManager
          elevated={false}
        >
          {/* Cluster Name */}
          <FormFieldCard
            title={`Name your ${templateTitle} Cluster`}
            link={
              <ExternalLink textVariant="caption2" url={pmkCliOverviewLink}>
                BareOS Cluster Help
              </ExternalLink>
            }
          >
            <ClusterNameField />
          </FormFieldCard>

          {/* Cluster Settings */}
          <FormFieldCard title="Cluster Settings">
            <KubernetesVersion />

            <Divider className={classes.divider} />
            <Text variant="caption1">Cluster Network Stack</Text>
            <NetworkStack {...props} />

            <Divider className={classes.divider} />
            <Text variant="caption1">Application & Container Settings</Text>
            <PrivilegedContainers {...props} />
            <AllowWorkloadsOnMaster />

            <Divider className={classes.divider} />
            <Text variant="caption1">Cluster Add-Ons</Text>
            <AddonTogglers
              addons={['etcdBackup', 'enableMetallb', 'prometheusMonitoringEnabled']}
            />
          </FormFieldCard>
        </ValidatedForm>
      </WizardStep>
      <WizardStep stepId="masters" label="Master Node" onNext={mastersOnNext}>
        <ValidatedForm
          fullWidth
          initialValues={wizardContext}
          onSubmit={setWizardContext}
          triggerSubmit={onNext}
          title="Select a node to add as a Master Node"
          link={
            <ExternalLink textVariant="caption2" url={pmkCliOverviewLink}>
              Not Seeing Any Nodes?
            </ExternalLink>
          }
        >
          <ClusterHostChooser
            selection="single"
            id="masterNodes"
            filterFn={allPass([isConnected, isUnassignedNode])}
            validations={[masterNodeLengthValidator]}
            pollForNodes
            required
          />
        </ValidatedForm>
      </WizardStep>
      <WizardStep stepId="workers" label="Worker Nodes" onNext={workersOnNext}>
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
      <WizardStep stepId="network" label="Network" onNext={networkOnNext}>
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

              <FormFieldCard title="Cluster Networking Range & HTTP Proxy">
                <ContainerAndServicesCIDRField />
                <HttpProxyField />
              </FormFieldCard>

              <FormFieldCard title="Cluster CNI">
                <NetworkBackendField
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                />
                {values.networkPlugin === NetworkBackendTypes.Calico && (
                  <CalicoNetworkFields values={values} />
                )}
              </FormFieldCard>
            </>
          )}
        </ValidatedForm>
      </WizardStep>
      <WizardStep stepId="advanced" label="Advanced" onNext={advancedOnNext}>
        <ValidatedForm
          initialValues={wizardContext}
          onSubmit={setWizardContext}
          triggerSubmit={onNext}
          title="Advanced Configuration"
        >
          {({ values }) => (
            <>
              <AdvancedApiConfigFields values={values} />
              <TagsField />
            </>
          )}
        </ValidatedForm>
      </WizardStep>
      <WizardStep stepId="review" label="Finalize & Review" onNext={reviewOnNext}>
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

export default PhysicalSingleMasterCluster

const reviewTableColumns = [
  { id: 'name', label: 'Cluster Name' },
  { id: 'kubernetesVersion', label: 'Kubernetes Version', insertDivider: true },
  { id: 'masterNodes', label: 'Master Nodes' },
  { id: 'workerNodes', label: 'Worker Nodes' },
  { id: 'externalDnsName', label: 'API FQDN', insertDivider: true },
  { id: 'externalDnsName', label: 'API FQDN' },
  { id: 'containersCidr', label: 'Containers CIDR' },
  { id: 'servicesCidr', label: 'Services CIDR' },
  {
    id: 'networkPlugin',
    label: 'CNI',
    render: (value) => capitalizeString(value),
    insertDivider: true,
  },
  { id: 'calicoIpIpMode', label: 'IP in IP Encapsulation Mode' },
  { id: 'calicoNatOutgoing', label: 'NAT Outgoing', render: (value) => castBoolToStr()(value) },
  { id: 'calicoV4BlockSize', label: 'Block Size' },
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
  { id: 'tags', label: 'Tags', render: (value) => <FormattedTags tags={value} /> },
]

const basicOnNext = (context) => {
  trackEvent('WZ New BareOS Cluster 1 Nodes Connected', {
    wizard_step: 'Initial Setup',
    wizard_state: 'In-Progress',
    wizard_progress: '1 of 6',
    wizard_name: 'Add New BareOS Cluster',
    cluster_name: context.name,
  })
}
const mastersOnNext = (context) => {
  trackEvent('WZ New BareOS Cluster 2 Master Nodes', {
    wizard_step: 'Select Master Nodes',
    wizard_state: 'In-Progress',
    wizard_progress: '2 of 6',
    wizard_name: 'Add New BareOS Cluster',
    master_nodes: (context.masterNodes && context.masterNodes.length) || 0,
    allow_workloads_on_master: context.allowWorkloadsOnMaster,
    privileged: context.privileged,
  })
}

const workersOnNext = (context) => {
  trackEvent('WZ New BareOS Cluster 3 Worker Nodes', {
    wizard_step: 'Select Worker Nodes',
    wizard_state: 'In-Progress',
    wizard_progress: '3 of 6',
    wizard_name: 'Add New BareOS Cluster',
    worker_nodes: (context.workerNodes && context.workerNodes.length) || 0,
  })
}

const networkOnNext = (context) => {
  trackEvent('WZ New BareOS Cluster 4 Networking Details', {
    wizard_step: 'Configure Network',
    wizard_state: 'In-Progress',
    wizard_progress: '4 of 6',
    wizard_name: 'Add New BareOS Cluster',
    network_backend: context.networkPlugin,
  })
}

const advancedOnNext = (context) => {
  trackEvent('WZ New BareOS Cluster 5 Advanced Configuration', {
    wizard_step: 'Advanced Configuration',
    wizard_state: 'In-Progress',
    wizard_progress: '5 of 6',
    wizard_name: 'Add New BareOS Cluster',
    enable_etcd_backup: !!context.enableEtcdBackup,
    enable_monitoring: !!context.prometheusMonitoringEnabled,
  })
}

const reviewOnNext = (context) => {
  trackEvent('WZ New BareOS Cluster 6 Review', {
    wizard_step: 'Review',
    wizard_state: 'Finished',
    wizard_progress: '6 of 6',
    wizard_name: 'Add New BareOS Cluster',
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
