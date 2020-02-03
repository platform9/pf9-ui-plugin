import React from 'react'
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
import Panel from 'app/plugins/theme/components/Panel'
import CodeBlock from 'core/components/CodeBlock'
import ExternalLink from 'core/components/ExternalLink'
import ClusterHostChooser, { excludeNodes, isConnected, isUnassignedNode } from './ClusterHostChooser'
import { clusterActions } from '../actions'
import { pathJoin } from 'utils/misc'
import { defaultEtcBackupPath, k8sPrefix } from 'app/constants'
import { makeStyles } from '@material-ui/styles'
import { masterNodeLengthValidator, requiredValidator } from 'core/utils/fieldValidators'
import { allPass } from 'ramda'
import useDataLoader from 'core/hooks/useDataLoader'
import { loadNodes } from '../../nodes/actions'
import EtcdBackupFields from '../EtcdBackupFields'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { routes } from 'core/utils/routes'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import Alert from 'core/components/Alert'
import { pmkCliOverviewLink, runtimePrivilegedLink } from 'k8s/links'

const listUrl = pathJoin(k8sPrefix, 'infrastructure')

const initialContext = {
  containersCidr: '10.20.0.0/16',
  servicesCidr: '10.21.0.0/16',
  networkPlugin: 'flannel',
  runtimeConfigOption: 'default',
  mtuSize: 1440,
  etcdStoragePath: defaultEtcBackupPath,
  etcdBackupInterval: 1,
  prometheusMonitoringEnabled: true,
  tags: [],
}

const runtimeConfigOptions = [
  { label: 'Default API groups and versions', value: 'default' },
  { label: 'All API groups and versions', value: 'all' },
  { label: 'Custom', value: 'custom' },
]

const networkPluginOptions = [
  { label: 'Flannel', value: 'flannel' },
  { label: 'Calico', value: 'calico' },
  { label: 'Canal (experimental)', value: 'canal' },
]

const useStyles = makeStyles(theme => ({
  formWidth: {
    width: 715,
  },
  tableWidth: {
    maxWidth: 715,
  },
  inputWidth: {
    maxWidth: 350,
    marginBottom: theme.spacing(3),
  },
  inline: {
    display: 'grid',
  },
  blueIcon: {
    color: theme.palette.primary.main,
  },
}))

const canFinishAndReview = ({ masterNodes, workerNodes, allowWorkloadsOnMaster }) => {
  const hasMasters = !!masterNodes && masterNodes.length > 0
  const hasWorkers = !!workerNodes && workerNodes.length > 0
  return hasMasters && (!!allowWorkloadsOnMaster || hasWorkers)
}

const AddBareOsClusterPage = () => {
  const classes = useStyles()
  const { history } = useReactRouter()
  const onComplete = (_,
    { uuid }) => history.push(routes.cluster.convergingNodes.path({ id: uuid }))
  const [createBareOSClusterAction, creatingBareOSCluster] = useDataUpdater(clusterActions.create, onComplete) // eslint-disable-line

  const handleSubmit = data => createBareOSClusterAction({
    ...data,
    clusterType: 'local',
  })
  const [nodes, loading] = useDataLoader(loadNodes)

  const hasFreeNodes = nodes.filter(isUnassignedNode).length > 0
  return (
    <FormWrapper
      title="Add Bare OS Cluster" backUrl={listUrl}
      loading={creatingBareOSCluster || loading}
      message={loading ? 'loading...' : 'Submitting form...'}>
      <Wizard
        onComplete={handleSubmit}
        context={initialContext}
        originPath={routes.cluster.add.path()}
        disableNext={!hasFreeNodes}
        showFinishAndReviewButton={canFinishAndReview}
      >
        {({ wizardContext, setWizardContext, onNext }) =>
          <>
            <WizardStep stepId="basic" label="Select Master Nodes">
              <ValidatedForm
                fullWidth
                initialValues={wizardContext}
                onSubmit={setWizardContext}
                triggerSubmit={onNext}
              >
                {({ setFieldValue, values }) => (
                  <>
                    <div className={classes.formWidth}>
                      {/* Cluster Name */}
                      <FormFieldCard title="Name your Kubernetes Cluster">
                        <div className={classes.inputWidth}>
                          <TextField
                            id="name" label="Name"
                            info="Name of the cluster"
                            onChange={value => setWizardContext({ name: value })}
                            required />
                        </div>
                      </FormFieldCard>
                      <FormFieldCard
                        title={<span>Select nodes to add as <u>Master</u> nodes</span>}
                        link={
                          <div>
                            <FontAwesomeIcon
                              className={classes.blueIcon}
                              size="md">file-alt</FontAwesomeIcon>{' '}
                            <ExternalLink url={pmkCliOverviewLink}>Not Seeing
                              Any
                              Nodes?</ExternalLink>
                          </div>
                        }
                      >
                        <div className={classes.tableWidth}>
                          {/* Master nodes */}
                          {/* <Typography>Select one or more nodes to add to the cluster as <strong>master</strong> nodes</Typography> */}
                          <ClusterHostChooser
                            multiple
                            id="masterNodes"
                            filterFn={allPass([
                              isConnected,
                              isUnassignedNode,
                            ])}
                            onChange={(value) => setWizardContext({ masterNodes: value })}
                            validations={[masterNodeLengthValidator]}
                            pollForNodes
                            required
                          />

                          {/* Workloads on masters */}
                          <div className={classes.inputWidth}>
                            <CheckboxField
                              id="allowWorkloadsOnMaster"
                              onChange={(value) => setWizardContext({ allowWorkloadsOnMaster: value })}
                              label="Make all Master nodes Master + Worker"
                              info="It is highly recommended to not enable workloads on master nodes for production or critical workload clusters."
                            />
                          </div>
                        </div>
                        <Panel
                          titleVariant="subtitle2"
                          title="Get the PF9 CLI"
                          defaultExpanded={false}
                          link={
                            <div>
                              <FontAwesomeIcon
                                className={classes.blueIcon}
                                size="md">code</FontAwesomeIcon>{' '}
                              <ExternalLink url={pmkCliOverviewLink}>See all
                                Options</ExternalLink>
                            </div>
                          }
                        >
                          <DownloadCliWalkthrough />
                        </Panel>
                      </FormFieldCard>
                    </div>
                  </>
                )}
              </ValidatedForm>
            </WizardStep>

            <WizardStep stepId="workers" label="Select Worker Nodes">
              <ValidatedForm
                fullWidth
                initialValues={wizardContext}
                onSubmit={setWizardContext}
                triggerSubmit={onNext}
              >
                {({ setFieldValue, values }) => (
                  <div className={classes.formWidth}>
                    {/* Worker nodes */}
                    <FormFieldCard
                      title={
                        <span>Select nodes to add as <u>Worker</u> nodes</span>}
                      link={
                        <div>
                          <FontAwesomeIcon
                            className={classes.blueIcon}
                            size="md">file-alt</FontAwesomeIcon>{' '}
                          <ExternalLink url={pmkCliOverviewLink}>Not Seeing Any
                            Nodes?</ExternalLink>
                        </div>
                      }
                    >
                      {/* <Typography>Select one or more nodes to add to the cluster as <strong>worker</strong> nodes</Typography> */}
                      <div className={classes.tableWidth}>
                        <ClusterHostChooser
                          multiple
                          id="workerNodes"
                          filterFn={allPass([
                            isUnassignedNode,
                            isConnected,
                            excludeNodes(wizardContext.masterNodes),
                          ])}
                          pollForNodes
                          onChange={(value) => setWizardContext({ workerNodes: value })}
                          validations={wizardContext.allowWorkloadsOnMaster ? null : [requiredValidator]}
                        />
                      </div>
                      <Panel
                        titleVariant="subtitle2"
                        title="Get the PF9 CLI"
                        defaultExpanded={false}
                        link={
                          <div>
                            <FontAwesomeIcon
                              className={classes.blueIcon}
                              size="md">code</FontAwesomeIcon>{' '}
                            <ExternalLink url={pmkCliOverviewLink}>See all
                              Options</ExternalLink>
                          </div>
                        }
                      >
                        <DownloadCliWalkthrough />
                      </Panel>
                    </FormFieldCard>
                  </div>
                )}
              </ValidatedForm>
            </WizardStep>

            <WizardStep stepId="network" label="Configure Network">
              <ValidatedForm
                initialValues={wizardContext}
                onSubmit={setWizardContext}
                triggerSubmit={onNext}
              >
                {({ setFieldValue, values }) => (
                  <div className={classes.formWidth}>
                    <FormFieldCard title="Networking Details">
                      <div className={classes.inputWidth}>
                        <TextField
                          id="masterVipIpv4"
                          label="Virtual IP address for cluster"
                          info={
                            <div>
                              Specify the virtual IP address that will be used
                              to provide access to
                              the API server endpoint for this cluster. A
                              virtual IP must be specified
                              if you want to grow the number of masters in the
                              future. Refer to{' '}
                              <a
                                href="https://docs.platform9.com/support/ha-for-baremetal-multimaster-kubernetes-cluster-service-type-load-balancer/"
                                target="_blank"
                              >
                                this article
                              </a>{' '}
                              for more information re how the VIP service
                              operates, VIP configuration,
                              etc.
                            </div>
                          }
                          required={(wizardContext.masterNodes || []).length > 1}
                        />

                        <PicklistField
                          DropdownComponent={VipInterfaceChooser}
                          id="masterVipIface"
                          label="Physical interface for virtual IP association"
                          info="Provide the name of the network interface that the virtual IP should be bound to. The virtual IP should be reachable from the network this interface connects to. Note: All master nodes should use the same interface (eg: ens3) that the virtual IP will be bound to."
                          masterNodes={wizardContext.masterNodes}
                          required={(wizardContext.masterNodes || []).length > 1}
                        />

                        {/* Assign public IP's */}
                        <CheckboxField
                          id="enableMetallb"
                          label="Enable MetalLB"
                          info="Select if MetalLB should load-balancer should be enabled for this cluster. Platform9 uses MetalLB - a load-balancer implementation for bare metal Kubernetes clusters that uses standard routing protocols - for service level load balancing. Enabling MetalLB on this cluster will provide the ability to create services of type load-balancer."
                        />

                        {values.enableMetallb && (
                          <TextField
                            id="metallbCidr"
                            label="Address pool range(s) for Metal LB"
                            info="Provide the IP address pool that MetalLB load-balancer is allowed to allocate from. You need to specify an explicit start-end range of IPs for the pool.  It takes the following format: startIP1-endIP1,startIP2-endIP2"
                            required
                          />
                        )}

                        {/* API FQDN */}
                        <TextField
                          id="externalDnsName"
                          label="API FQDN"
                          info="FQDN (Fully Qualified Domain Name) is used to reference cluster API. To ensure the API can be accessed securely at the FQDN, the FQDN will be included in the API server certificate's Subject Alt Names. If deploying onto a cloud provider, we will automatically create the DNS records for this FQDN using the cloud provider’s DNS service."
                        />

                        {/* Containers CIDR */}
                        <TextField
                          id="containersCidr"
                          label="Containers CIDR"
                          info="Defines the network CIDR from which the flannel networking layer allocates IP addresses to Docker containers. This CIDR should not overlap with the VPC CIDR. Each node gets a /24 subnet. Choose a CIDR bigger than /23 depending on the number of nodes in your cluster. A /16 CIDR gives you 256 nodes."
                          required
                        />

                        {/* Services CIDR */}
                        <TextField
                          id="servicesCidr"
                          label="Services CIDR"
                          info="Defines the network CIDR from which Kubernetes allocates virtual IP addresses to Services.  This CIDR should not overlap with the VPC CIDR."
                          required
                        />

                        {/* HTTP proxy */}
                        <TextField
                          id="httpProxy"
                          label="HTTP Proxy"
                          info={<div className={classes.inline}>(Optional)
                            Specify the HTTP proxy for this cluster. Uses format
                            of <CodeBlock><span>{'<scheme>://<username>:<password>@<host>:<port>'}</span></CodeBlock> where
                            username and password are optional.</div>}
                        />
                        <PicklistField
                          id="networkPlugin"
                          label="Network backend"
                          options={networkPluginOptions}
                          info=""
                          required
                        />
                        {values.networkPlugin === 'calico' && (
                          <TextField
                            id="mtuSize"
                            label="MTU Size"
                            info="Maximum Transmission Unit (MTU) for the interface (in bytes)"
                            required
                          />
                        )}
                      </div>
                    </FormFieldCard>
                  </div>
                )}
              </ValidatedForm>
            </WizardStep>

            <WizardStep stepId="advanced" label="Advanced Configuration">
              <ValidatedForm
                initialValues={wizardContext}
                onSubmit={setWizardContext}
                triggerSubmit={onNext}
              >
                {({ setFieldValue, values }) => (
                  <div className={classes.formWidth}>
                    <FormFieldCard title="Final Tweaks">
                      <div className={classes.inputWidth}>
                        {/* Privileged */}
                        <CheckboxField
                          id="privileged"
                          label="Privileged"
                          value={values.privileged || ['calico', 'canal', 'weave'].includes(wizardContext.networkPlugin)}
                          disabled={['calico', 'canal', 'weave'].includes(wizardContext.networkPlugin)}
                          info={<div>
                            Allows this cluster to run privileged containers.
                            Read <ExternalLink url={runtimePrivilegedLink}>this
                            article</ExternalLink> for more information.
                          </div>}
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

                        { !values.prometheusMonitoringEnabled && <Alert small variant="error" message="The PMK management plane is not able to monitor the cluster health." /> }

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
                      </div>
                    </FormFieldCard>
                  </div>
                )}
              </ValidatedForm>
            </WizardStep>

            <WizardStep stepId="review" label="Review">
              <ValidatedForm
                initialValues={wizardContext}
                onSubmit={setWizardContext}
                triggerSubmit={onNext}
              >
                <div className={classes.formWidth}>
                  <FormFieldCard title="Finish and Review">
                    <div className={classes.tableWidth}>
                      <BareOsClusterReviewTable data={wizardContext} />
                    </div>
                  </FormFieldCard>
                </div>
              </ValidatedForm>
            </WizardStep>
          </>
        }
      </Wizard>
    </FormWrapper>
  )
}

export default AddBareOsClusterPage
