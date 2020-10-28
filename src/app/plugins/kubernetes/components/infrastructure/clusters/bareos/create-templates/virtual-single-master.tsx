/* eslint-disable max-len */
import React, { FC } from 'react'
// import { allPass } from 'ramda'
import { makeStyles } from '@material-ui/styles'

import { pmkCliOverviewLink } from 'k8s/links'
import { defaultEtcBackupPath } from 'app/constants'
// import { capitalizeString, castBoolToStr } from 'utils/misc'

import ExternalLink from 'core/components/ExternalLink'
// import { masterNodeLengthValidator } from 'core/utils/fieldValidators'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
// import FormReviewTable from 'core/components/validatedForm/review-table'
import WizardStep from 'core/components/wizard/WizardStep'

import ClusterNameField from '../../form-components/name'
// import ClusterHostChooser, { isConnected, isUnassignedNode } from '../ClusterHostChooser'
import KubernetesVersion from '../../form-components/kubernetes-version'

import Theme from 'core/themes/model'
import { trackEvent } from 'utils/tracking'
import { Divider } from '@material-ui/core'
import Text from 'core/elements/text'
import NetworkStack from '../../form-components/network-stack'
import PrivilegedContainers from '../../form-components/privileged'
import AllowWorkloadsOnMaster from '../../form-components/allow-workloads-on-master'
import { AddonTogglers } from '../../form-components/cluster-addon-manager'
import EtcdBackupFields from '../../form-components/etcd-backup'

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

const fields = {
  backup: EtcdBackupFields,
}
console.log(fields)

const VirtualSingleMasterCluster: FC<Props> = ({ onNext, ...props }) => {
  const classes = useStyles({})
  return (
    <>
      <WizardStep stepId="basic" label="Initial Setup" onNext={basicOnNext}>
        <ValidatedForm
          fullWidth
          classes={{ root: classes.validatedFormContainer }}
          initialValues={props.wizardContext}
          onSubmit={props.setWizardContext}
          triggerSubmit={onNext}
          withAddonManager
          elevated={false}
        >
          {/* <PollingData loading={loading} onReload={reload} hidden /> */}
          {/* Cluster Name */}
          <FormFieldCard
            title={`Name your${templateTitle} Cluster`}
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
            <KubernetesVersion {...props} />

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
      <WizardStep stepId="masters" label="Master Nodes" onNext={mastersOnNext}>
        <ValidatedForm
          fullWidth
          initialValues={props.wizardContext}
          onSubmit={props.setWizardContext}
          triggerSubmit={onNext}
          elevated={false}
        >
          {({ values }) => (
            <>
              {/* <FormFieldCard
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
                    <ExternalLink url={pmkCliOverviewLink}>Not Seeing Any Nodes?</ExternalLink>
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
                <CheckboxField
                  id="allowWorkloadsOnMaster"
                  onChange={(value) => setWizardContext({ allowWorkloadsOnMaster: value })}
                  label="Enable workloads on all master nodes"
                  info="It is highly recommended to not enable workloads on master nodes for production or critical workload clusters."
                />

                <CheckboxField
                  id="privileged"
                  label="Privileged"
                  onChange={(value) => setWizardContext({ privileged: value })}
                  value={
                    wizardContext.privileged ||
                    ['calico', 'canal', 'weave'].includes(wizardContext.networkPlugin)
                  }
                  disabled={['calico', 'canal', 'weave'].includes(wizardContext.networkPlugin)}
                  infoPlacement="right-end"
                  info={
                    <div>
                      Allows this cluster to run privileged containers. Read{' '}
                      <ExternalLink url={runtimePrivilegedLink}>this article</ExternalLink> for more
                      information. This is required for Calico CNI and CSI.
                    </div>
                  }
                />
              </FormFieldCard> */}
            </>
          )}
        </ValidatedForm>
      </WizardStep>
      <WizardStep stepId="workers" label="Worker Nodes" onNext={workersOnNext}>
        <ValidatedForm
          fullWidth
          initialValues={props.wizardContext}
          onSubmit={props.setWizardContext}
          triggerSubmit={onNext}
          elevated={false}
        >
          {/* <FormFieldCard
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
            <div className={classes.innerWrapper}>
              <ClusterHostChooser
                selection="multiple"
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
          </FormFieldCard> */}
        </ValidatedForm>
      </WizardStep>
      <WizardStep stepId="network" label="Network" onNext={networkOnNext}>
        <ValidatedForm
          initialValues={props.wizardContext}
          onSubmit={props.setWizardContext}
          triggerSubmit={onNext}
          elevated={false}
        >
          {({ values }) => (
            <>
              {/* <FormFieldCard title="Cluster Virtual IP Setup">
                <TextField
                  id="masterVipIpv4"
                  label="Virtual IP address for cluster"
                  info={
                    <div>
                      The virtual IP address to provide access to the API server endpoint for this
                      cluster. A virtual IP must be specified to grow the number of masters in the
                      future. Refer to{' '}
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


                <TextField
                  id="externalDnsName"
                  label="API FQDN"
                  infoPlacement="right-end"
                  info="Fully Qualified Domain Name used to reference the cluster API. The API will be secured by including the FQDN in the API server certificate’s Subject Alt Names. Clusters in Public Cloud will automatically have the DNS records created and registered for the FQDN."
                />
              </FormFieldCard>

              <FormFieldCard title="Cluster Networking Range & HTTP Proxy">

                <TextField
                  id="containersCidr"
                  label="Containers CIDR"
                  info="Network CIDR from which Kubernetes allocates IP addresses to containers. This CIDR shouldn't overlap with the VPC CIDR. A /16 CIDR enables 256 nodes."
                  required
                  validations={[IPValidator, cidrBlockSizeValidator]}
                />


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
              </FormFieldCard> */}
            </>
          )}
        </ValidatedForm>
      </WizardStep>
      <WizardStep stepId="advanced" label="Advanced" onNext={advancedOnNext}>
        <ValidatedForm
          initialValues={props.wizardContext}
          onSubmit={props.setWizardContext}
          triggerSubmit={onNext}
          title="Final Tweaks"
        >
          {({ values }) => (
            <>
              {/* <CheckboxField
                id="etcdBackup"
                label="Enable etcd Backup"
                info="Enable automated etcd backups on this cluster"
              />

              {values.etcdBackup && <EtcdBackupFields />}


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


              <PicklistField
                id="runtimeConfigOption"
                label="Advanced API Configuration"
                options={runtimeConfigOptions}
                info="Make sure you are familiar with the Kubernetes API configuration documentation before enabling this option."
                required
              />

              {values.runtimeConfigOption === 'custom' && (
                <TextField id="customRuntimeConfig" label="Custom API Configuration" info="" />
              )} */}

              {/* Enable Application Catalog */}
              {/* <CheckboxField
              id="appCatalogEnabled"
              label="Enable Application Catalog"
              info="Enable the Helm Application Catalog on this cluster"
            /> */}

              {/* <KeyValuesField id="tags" label="Tags" info="Add tag metadata to this cluster" /> */}
            </>
          )}
        </ValidatedForm>
      </WizardStep>
      <WizardStep stepId="review" label="Review" onNext={reviewOnNext}>
        <ValidatedForm
          initialValues={props.wizardContext}
          onSubmit={props.setWizardContext}
          triggerSubmit={onNext}
          title="Finish and Review"
        >
          {/* <BareOsClusterReviewTable data={wizardContext} /> */}
        </ValidatedForm>
      </WizardStep>{' '}
    </>
  )
}

export default VirtualSingleMasterCluster

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
