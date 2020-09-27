import React, { useEffect, useState, useCallback, useRef } from 'react'
import FormWrapper from 'core/components/FormWrapper'
import BareOsClusterReviewTable from './BareOsClusterReviewTable'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import KeyValuesField from 'core/components/validatedForm/KeyValuesField'
import PicklistField from 'core/components/validatedForm/PicklistField'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import VipInterfaceChooser from './VipInterfaceChooser'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import useDataUpdater from 'core/hooks/useDataUpdater'
import useReactRouter from 'use-react-router'
import DownloadCliWalkthrough from '../../nodes/DownloadCliWalkthrough'
import CodeBlock from 'core/components/CodeBlock'
import ExternalLink from 'core/components/ExternalLink'
import ClusterHostChooser, {
  excludeNodes,
  isConnected,
  isUnassignedNode,
} from './ClusterHostChooser'
import { clusterActions } from '../actions'
import { pathJoin } from 'utils/misc'
import { defaultEtcBackupPath, k8sPrefix } from 'app/constants'
import { makeStyles } from '@material-ui/styles'
import {
  masterNodeLengthValidator,
  requiredValidator,
  customValidator,
} from 'core/utils/fieldValidators'
import { allPass } from 'ramda'
import EtcdBackupFields from '../EtcdBackupFields'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { routes } from 'core/utils/routes'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import Alert from 'core/components/Alert'
import {
  pmkCliOverviewLink,
  runtimePrivilegedLink,
  pmkCliPrepNodeLink,
  pf9PmkArchitectureDigLink,
} from 'k8s/links'
import { trackEvent } from 'utils/tracking'
import { loadNodes } from '../../nodes/actions'
import useDataLoader from 'core/hooks/useDataLoader'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@material-ui/core'
import Text from 'core/elements/text'
import { hexToRGBA } from 'core/utils/colorHelpers'
import PollingData from 'core/components/PollingData'

const listUrl = pathJoin(k8sPrefix, 'infrastructure')

const initialContext = {
  containersCidr: '10.20.0.0/16',
  servicesCidr: '10.21.0.0/16',
  networkPlugin: 'flannel',
  runtimeConfigOption: 'default',
  mtuSize: 1440,
  etcdStoragePath: defaultEtcBackupPath,
  etcdBackupInterval: 60 * 24,
  prometheusMonitoringEnabled: true,
  tags: [],
  appCatalogEnabled: false,
}
// IP and Block Size validator
// /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(0?[1-9]|[12][0-9]|3[01])$/

const calicoBlockSizeValidator = customValidator((value, formValues) => {
  const blockSize = `${formValues.containersCidr}`.split('/')[1]
  return value > 20 && value < 32 && value > blockSize
}, 'Calico Block Size must be greater than 20, less than 32 and not conflict with the Container CIDR')

const cidrBlockSizeValidator = customValidator((value) => {
  const blockSize = `${value}`.split('/')[1]
  return blockSize > 0 && blockSize < 32
}, 'Block Size must be greater than 0 and less than 32')

const isValidIpAddress = (ip) => {
  // validates the octect ranges for an IP
  if (ip === '0.0.0.0' || ip === '255.255.255.255') {
    return false
  }
  return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
    ip,
  )
}

const IPValidator = customValidator((value, formValues) => {
  const IP = `${value}`.split('/')[0]
  return isValidIpAddress(IP)
}, 'IP invalid, must be between 0.0.0.0 and 255.255.255.255')

const IPValidatorRange = customValidator((value, formValues) => {
  const pairs = value.split(',')
  if (!pairs.length) return false

  for (const pair of pairs) {
    const [startIp, endIp] = pair.split('-')
    if (!isValidIpAddress(startIp) || !isValidIpAddress(endIp)) {
      return false
    }
  }
  return true
}, 'Invalid format, must be valid IP addresses of the form: startIP1-endIP1,startIP2-endIP2')

const containerAndServicesIPEqualsValidator = customValidator((value, formValues) => {
  const containersIP = `${formValues.containersCidr}`.split('/')[0]
  const servicesIP = `${value}`.split('/')[0]
  return containersIP !== servicesIP
}, 'The services CIDR cannot have the same IP address as the containers CIDR')

const runtimeConfigOptions = [
  { label: 'Default API groups and versions', value: 'default' },
  { label: 'All API groups and versions', value: 'all' },
  { label: 'Custom', value: 'custom' },
]

const networkPluginOptions = [
  { label: 'Flannel', value: 'flannel' },
  { label: 'Calico', value: 'calico' },
  // { label: 'Canal (experimental)', value: 'canal' },
]

const calicoIpIpOptions = [
  { label: 'Always', value: 'Always' },
  { label: 'Cross Subnet', value: 'CrossSubnet' },
  { label: 'Never', value: 'Never' },
]
const calicoIpIPHelpText = {
  Always: 'Encapsulates POD traffic in IP-in-IP between nodes.',
  CrossSubnet:
    'Encapsulation when nodes span subnets and cross routers that may drop native POD traffic, this is not required between nodes with L2 connectivity.',
  Never: 'Disables IP in IP Encapsulation.',
}

const handleNetworkPluginChange = (option, wizardContext) => {
  const payload = {
    networkPlugin: option,
    privileged: option === 'calico' ? true : wizardContext.privileged,
    calicoIpIpMode: option === 'calico' ? 'Always' : undefined,
    calicoNatOutgoing: option === 'calico' ? true : undefined,
    calicoV4BlockSize: option === 'calico' ? '24' : undefined,
  }
  return payload
}

const useStyles = makeStyles((theme) => ({
  inline: {
    display: 'grid',
  },
  innerWrapper: {
    marginBottom: theme.spacing(2),
  },
  blueIcon: {
    color: theme.palette.primary.main,
  },
  paddBottom: {
    paddingBottom: theme.spacing(4),
  },
  alert: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    backgroundColor: hexToRGBA(theme.palette.primary.main, 0.1),
    display: 'grid',
    gridGap: theme.spacing(),
    gridTemplateColumns: 'min-content 1fr',
  },
}))

// Segment tracking for wizard steps
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

const canFinishAndReview = ({
  masterNodes,
  workerNodes,
  allowWorkloadsOnMaster,
  masterVipIpv4,
  masterVipIface,
}) => {
  const hasMasters = !!masterNodes && masterNodes.length > 0
  const hasOneMaster = hasMasters && masterNodes.length === 1
  const hasMultipleMasters = hasMasters && masterNodes.length >= 1
  const hasWorkers = !!workerNodes && workerNodes.length > 0
  return (
    (hasOneMaster && (!!allowWorkloadsOnMaster || hasWorkers)) ||
    (hasMultipleMasters && !!masterVipIpv4 && !!masterVipIface)
  )
}

const AddBareOsClusterPage = () => {
  const classes = useStyles()
  const { history } = useReactRouter()
  const [nodes, loading, reload] = useDataLoader(loadNodes)
  const [showDialog, setShowDialog] = useState(false)
  const wizRef = useRef(null)
  const validatorRef = useRef(null)

  useEffect(() => {
    trackEvent('WZ New BareOS Cluster 0 Started', {
      wizard_step: 'Start',
      wizard_state: 'Started',
      wizard_progress: '0 of 6',
      wizard_name: 'Add New BareOS Cluster',
    })
  }, [])

  const onComplete = (_, { uuid }) => history.push(routes.cluster.nodeHealth.path({ id: uuid }))

  const [createBareOSClusterAction, creatingBareOSCluster] = useDataUpdater(
    clusterActions.create,
    onComplete,
  ) // eslint-disable-line

  const handleSubmit = (data) =>
    createBareOSClusterAction({
      ...data,
      clusterType: 'local',
    })
  useEffect(() => {
    wizRef.current && wizRef.current.onNext(handleHasNodesNextCheck)
  }, [nodes, wizRef])

  const setupValidator = (onNext) => (validate) => {
    wizRef.current = { onNext }
    validatorRef.current = { validate }
  }
  const handleHasNodesNextCheck = useCallback(() => {
    const isValid = validatorRef.current.validate()
    if (!isValid) {
      // if the form isn't filled out make sure they do that first.
      return false
    }
    if (nodes.filter(allPass([isConnected, isUnassignedNode])).length === 0) {
      // if they dont have any nodes then tell them to set that up first before moving forward
      setShowDialog(true)
      return false
    }
    return true
  }, [nodes])
  return (
    <FormWrapper title="Add Bare OS Cluster" backUrl={listUrl} loading={creatingBareOSCluster}>
      <Dialog open={showDialog}>
        <DialogTitle>
          <Text variant="h5" component="span">
            No Nodes Ready
          </Text>
        </DialogTitle>
        <DialogContent>
          <Text variant="body1">
            To build a BareOS cluster at least one node needs to be attached to the Management Plane
            and not in use by an existing cluster.
          </Text>
          <br />
          <Text variant="subtitle2">How do I attach a node?</Text>
          <div className={classes.alert}>
            <Text variant="subtitle2" className="no-wrap-text">
              The Platform9 CLI
            </Text>
            <Text variant="body1">
              The Platform9 CLI is used to prepare and attach nodes to the Management Plane. The CLI
              should be run on each node using the ‘prep-node’ command. ‘prep-node’ authenticates
              the node to the Management Plane and installs all of the required Kubernetes
              prerequisites.
            </Text>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)} color="primary">
            <Text variant="body1">Close</Text>
          </Button>
        </DialogActions>
      </Dialog>
      <Wizard
        onComplete={handleSubmit}
        context={initialContext}
        originPath={routes.cluster.add.path()}
        showFinishAndReviewButton={canFinishAndReview}
      >
        {({ wizardContext, setWizardContext, onNext }) => (
          <>
            <WizardStep stepId="basic" label="Initial Setup" onNext={basicOnNext}>
              <ValidatedForm
                fullWidth
                initialValues={wizardContext}
                onSubmit={setWizardContext}
                triggerSubmit={setupValidator(onNext)}
                elevated={false}
              >
                <PollingData loading={loading} onReload={reload} hidden />
                {/* Cluster Name */}
                <FormFieldCard title="Name your Kubernetes Cluster">
                  <TextField
                    id="name"
                    label="Name"
                    info="Name of the cluster"
                    onChange={(value) => setWizardContext({ name: value })}
                    required
                  />
                </FormFieldCard>
                <FormFieldCard
                  title="Connect BareOS Nodes"
                  link={
                    <div>
                      <FontAwesomeIcon className={classes.blueIcon} size="md">
                        file-alt
                      </FontAwesomeIcon>{' '}
                      <ExternalLink url={pmkCliPrepNodeLink}>See all PF9CTL options</ExternalLink>
                    </div>
                  }
                >
                  <DownloadCliWalkthrough />
                </FormFieldCard>
                <FormFieldCard
                  title="Connected Nodes"
                  link={
                    <div>
                      <FontAwesomeIcon className={classes.blueIcon} size="md">
                        ball-pile
                      </FontAwesomeIcon>{' '}
                      <ExternalLink url={pmkCliOverviewLink}>Not Seeing Any Nodes?</ExternalLink>
                    </div>
                  }
                >
                  <div className={classes.innerWrapper}>
                    {/* Master nodes */}
                    {/* <Text>Select one or more nodes to add to the cluster as <strong>master</strong> nodes</Text> */}
                    <ClusterHostChooser
                      selection="none"
                      filterFn={allPass([isConnected, isUnassignedNode])}
                      pollForNodes
                    />
                  </div>
                </FormFieldCard>
              </ValidatedForm>
            </WizardStep>

            <WizardStep stepId="masters" label="Select Master Nodes" onNext={mastersOnNext}>
              <ValidatedForm
                fullWidth
                initialValues={wizardContext}
                onSubmit={setWizardContext}
                triggerSubmit={onNext}
                elevated={false}
              >
                {({ values }) => (
                  <>
                    {/* Worker nodes */}
                    <FormFieldCard
                      title={
                        <span>
                          Select nodes to add as <u>Master</u> nodes
                        </span>
                      }
                      link={
                        <div>
                          <FontAwesomeIcon className={classes.blueIcon} size="md">
                            file-alt
                          </FontAwesomeIcon>{' '}
                          <ExternalLink url={pmkCliOverviewLink}>
                            Not Seeing Any Nodes?
                          </ExternalLink>
                        </div>
                      }
                    >
                      <div className={classes.innerWrapper}>
                        <ClusterHostChooser
                          selection="multiple"
                          id="masterNodes"
                          filterFn={allPass([isConnected, isUnassignedNode])}
                          onChange={(value) => setWizardContext({ masterNodes: value })}
                          validations={[masterNodeLengthValidator]}
                          pollForNodes
                          required
                        />
                      </div>
                    </FormFieldCard>
                    <FormFieldCard title="Cluster Settings">
                      {/* Workloads on masters */}
                      <CheckboxField
                        id="allowWorkloadsOnMaster"
                        onChange={(value) => setWizardContext({ allowWorkloadsOnMaster: value })}
                        label="Enable workloads on all master nodes"
                        info="It is highly recommended to not enable workloads on master nodes for production or critical workload clusters."
                      />

                      {/* Privileged */}
                      <CheckboxField
                        id="privileged"
                        label="Privileged"
                        onChange={(value) => setWizardContext({ privileged: value })}
                        value={
                          wizardContext.privileged ||
                          ['calico', 'canal', 'weave'].includes(wizardContext.networkPlugin)
                        }
                        disabled={['calico', 'canal', 'weave'].includes(
                          wizardContext.networkPlugin,
                        )}
                        infoPlacement="right-end"
                        info={
                          <div>
                            Allows this cluster to run privileged containers. Read{' '}
                            <ExternalLink url={runtimePrivilegedLink}>this article</ExternalLink>{' '}
                            for more information. This is required for Calico CNI and CSI.
                          </div>
                        }
                      />
                    </FormFieldCard>
                  </>
                )}
              </ValidatedForm>
            </WizardStep>

            <WizardStep stepId="workers" label="Select Worker Nodes" onNext={workersOnNext}>
              <ValidatedForm
                fullWidth
                initialValues={wizardContext}
                onSubmit={setWizardContext}
                triggerSubmit={onNext}
                elevated={false}
              >
                {/* Worker nodes */}
                <FormFieldCard
                  title={
                    <span>
                      Select nodes to add as <u>Worker</u> nodes
                    </span>
                  }
                  link={
                    <div>
                      <FontAwesomeIcon className={classes.blueIcon} size="md">
                        file-alt
                      </FontAwesomeIcon>{' '}
                      <ExternalLink url={pmkCliOverviewLink}>Not Seeing Any Nodes?</ExternalLink>
                    </div>
                  }
                >
                  {/* <Text>Select one or more nodes to add to the cluster as <strong>worker</strong> nodes</Text> */}
                  <div className={classes.innerWrapper}>
                    <ClusterHostChooser
                      className={classes.hostChooser}
                      selection="multiple"
                      id="workerNodes"
                      filterFn={allPass([
                        isUnassignedNode,
                        isConnected,
                        excludeNodes(wizardContext.masterNodes),
                      ])}
                      pollForNodes
                      onChange={(value) => setWizardContext({ workerNodes: value })}
                      validations={
                        wizardContext.allowWorkloadsOnMaster ? null : [requiredValidator]
                      }
                    />
                  </div>
                </FormFieldCard>
              </ValidatedForm>
            </WizardStep>

            <WizardStep stepId="network" label="Configure Network" onNext={networkOnNext}>
              <ValidatedForm
                initialValues={wizardContext}
                onSubmit={setWizardContext}
                triggerSubmit={onNext}
                className={classes.paddBottom}
                elevated={false}
              >
                {({ values }) => (
                  <>
                    <FormFieldCard title="Cluster Virtual IP Setup">
                      <TextField
                        id="masterVipIpv4"
                        label="Virtual IP address for cluster"
                        info={
                          <div>
                            The virtual IP address to provide access to the API server endpoint for
                            this cluster. A virtual IP must be specified to grow the number of
                            masters in the future. Refer to{' '}
                            <a href={pf9PmkArchitectureDigLink} target="_blank">
                              this article
                            </a>{' '}
                            for help on VIP operations and configuration
                          </div>
                        }
                        onChange={(value) => setWizardContext({ masterVipIpv4: value })}
                        required={(wizardContext.masterNodes || []).length > 1}
                      />

                      <PicklistField
                        DropdownComponent={VipInterfaceChooser}
                        id="masterVipIface"
                        label="Physical interface for virtual IP association"
                        infoPlacement="right-end"
                        info="The name of the network interface that the virtual IP will be bound. The virtual IP must be reachable from the network the interface connects to. All master nodes must use the same interface (eg: ens3)."
                        masterNodes={wizardContext.masterNodes}
                        onChange={(value) => setWizardContext({ masterVipIface: value })}
                        required={(wizardContext.masterNodes || []).length > 1}
                      />

                      {/* API FQDN */}
                      <TextField
                        id="externalDnsName"
                        label="API FQDN"
                        infoPlacement="right-end"
                        info="Fully Qualified Domain Name used to reference the cluster API. The API will be secured by including the FQDN in the API server certificate’s Subject Alt Names. Clusters in Public Cloud will automatically have the DNS records created and registered for the FQDN."
                      />
                    </FormFieldCard>

                    <FormFieldCard title="Cluster Networking Range & HTTP Proxy">
                      {/* Containers CIDR */}
                      <TextField
                        id="containersCidr"
                        label="Containers CIDR"
                        info="Network CIDR from which Kubernetes allocates IP addresses to containers. This CIDR shouldn't overlap with the VPC CIDR. A /16 CIDR enables 256 nodes."
                        required
                        validations={[IPValidator, cidrBlockSizeValidator]}
                      />

                      {/* Services CIDR */}
                      <TextField
                        id="servicesCidr"
                        label="Services CIDR"
                        info="The network CIDR for Kubernetes virtual IP addresses for Services. This CIDR shouldn't overlap with the VPC CIDR."
                        required
                        validations={[
                          IPValidator,
                          containerAndServicesIPEqualsValidator,
                          cidrBlockSizeValidator,
                        ]}
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
                    </FormFieldCard>

                    <FormFieldCard title="Cluster CNI">
                      <PicklistField
                        id="networkPlugin"
                        label="Network backend"
                        onChange={(value) =>
                          setWizardContext(handleNetworkPluginChange(value, wizardContext))
                        }
                        options={networkPluginOptions}
                        info=""
                        required
                      />
                      {values.networkPlugin === 'calico' && (
                        <>
                          <PicklistField
                            id="calicoIpIpMode"
                            value={wizardContext.calicoIpIpMode}
                            label="IP in IP Encapsulation Mode"
                            onChange={(value) => setWizardContext({ calicoIpIpMode: value })}
                            options={calicoIpIpOptions}
                            info={calicoIpIPHelpText[wizardContext.calicoIpIpMode] || ''}
                            required
                          />
                          <CheckboxField
                            id="calicoNatOutgoing"
                            value={wizardContext.calicoNatOutgoing}
                            onChange={(value) => setWizardContext({ calicoNatOutgoing: value })}
                            label="NAT Outgoing"
                            info="Packets destined outside the POD network will be SNAT'd using the node's IP."
                          />
                          <TextField
                            id="calicoV4BlockSize"
                            value={wizardContext.calicoV4BlockSize}
                            label="Block Size"
                            onChange={(value) => setWizardContext({ calicoV4BlockSize: value })}
                            info="Block size determines how many Pod's can run per node vs total number of nodes per cluster. Example /22 enables 1024 IPs per node, and a maximum of 64 nodes. Block size must be greater than 20 and less than 32 and not conflict with the Contain CIDR"
                            required
                            validations={[calicoBlockSizeValidator]}
                          />
                          <TextField
                            id="mtuSize"
                            label="MTU Size"
                            info="Maximum Transmission Unit (MTU) for the interface (in bytes)"
                            required
                          />
                        </>
                      )}
                    </FormFieldCard>

                    <FormFieldCard title="Cluster Load Balancer">
                      {/* Assign public IP's */}
                      <CheckboxField
                        id="enableMetallb"
                        label="Enable MetalLB"
                        infoPlacement="right-end"
                        info="Platform9 uses MetalLB for bare metal service level load balancing. Enabling MetalLB will provide the ability to create services of type load-balancer."
                      />

                      {values.enableMetallb && (
                        <TextField
                          id="metallbCidr"
                          label="Address pool range(s) for Metal LB"
                          info="Specify the MetalLB start-end IP pool. Format: startIP1-endIP1,startIP2-endIP2"
                          validations={[IPValidatorRange]}
                          required
                        />
                      )}
                    </FormFieldCard>
                  </>
                )}
              </ValidatedForm>
            </WizardStep>

            <WizardStep stepId="advanced" label="Advanced Configuration" onNext={advancedOnNext}>
              <ValidatedForm
                initialValues={wizardContext}
                onSubmit={setWizardContext}
                triggerSubmit={onNext}
                title="Final Tweaks"
              >
                {({ values }) => (
                  <>
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
                <BareOsClusterReviewTable data={wizardContext} />
              </ValidatedForm>
            </WizardStep>
          </>
        )}
      </Wizard>
    </FormWrapper>
  )
}

export default AddBareOsClusterPage
