import React from 'react'
import ApiClient from 'api-client/ApiClient'
import FormWrapper from 'core/components/FormWrapper'
import BareOsClusterReviewTable from './BareOsClusterReviewTable'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import ClusterHostChooser from './ClusterHostChooser'
import KeyValuesField from 'core/components/validatedForm/KeyValuesField'
import PicklistField from 'core/components/validatedForm/PicklistField'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import VipInterfaceChooser from './VipInterfaceChooser'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import useDataUpdater from 'core/hooks/useDataUpdater'
import useParams from 'core/hooks/useParams'
import useReactRouter from 'use-react-router'
import { clusterActions } from '../actions'
import { pick } from 'ramda'
import { pathJoin } from 'utils/misc'
import { k8sPrefix } from 'app/constants'

const { qbert } = ApiClient.getInstance()

const listUrl = pathJoin(k8sPrefix, 'infrastructure')

const initialContext = {
  containersCidr: '10.20.0.0/16',
  servicesCidr: '10.21.0.0/16',
  networkPlugin: 'flannel',
  runtimeConfigOption: 'default',
  mtuSize: 1440,
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

const AddBareOsClusterPage = () => {
  const { params, getParamsUpdater } = useParams()
  const { history } = useReactRouter()
  const onComplete = () => {
    history.push('/ui/kubernetes/infrastructure#clusters')
  }
  const [create, loading] = useDataUpdater(clusterActions.create, onComplete) // eslint-disable-line

  const handleSubmit = params => async data => {
    const body = {
      // basic info
      ...pick('name'.split(' '), data),

      // cluster configuration
      ...pick('allowWorkloadsOnMaster'.split(' '), data),

      // network info
      ...pick('assignPublicIps masterSubnetName workerSubnetName externalDnsName serviceFqdn containersCidr servicesCidr networkPlugin'.split(' '), data),

      // advanced configuration
      ...pick('privileged appCatalogEnabled customAmi tags'.split(' '), data),
    }
    if (data.httpProxy) { body.httpProxy = data.httpProxy }
    if (data.networkPlugin === 'calico') { body.mtuSize = data.mtuSize }
    if (data.enableMetallb) {
      body.metallbCidr = data.metallbCidr
    }

    data.runtimeConfig = {
      default: '',
      all: 'api/all=true',
      custom: data.customRuntimeConfig,
    }[data.runtimeConfigOption]

    // 1. Get the nodePoolUuid from the nodePools API and look for the pool with name 'defaultPool'
    const nodePools = await qbert.getNodePools()
    data.nodePoolUuid = nodePools.find(x => x.name === 'defaultPool').uuid

    // 2. Create the cluster
    await create(body)

    // 3. Attach the nodes
    const nodes = [
      ...data.masterNodes.map(uuid => ({ isMaster: true, uuid })),
      ...data.workerNodes.map(uuid => ({ isMaster: false, uuid })),
    ]
    qbert.attachNodes(body.clusterUuid, nodes)

    return body
  }

  return (
    <FormWrapper title="Add Bare OS Cluster" backUrl={listUrl} loading={loading}>
      <Wizard onComplete={handleSubmit(params)} context={initialContext} originPath={`${k8sPrefix}/infrastructure/clusters/add`}>
        {({ wizardContext, setWizardContext, onNext }) => {
          return (
            <>
              <WizardStep stepId="basic" label="Basic Info">
                <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                  {({ setFieldValue, values }) => (
                    <>
                      {/* Cluster Name */}
                      <TextField
                        id="name"
                        label="Name"
                        info="Name of the cluster"
                        required
                      />

                      <div>TODO: Download CLI tool. (pending backend work)</div>

                      {/* Master nodes */}
                      <ClusterHostChooser
                        id="masterNodes"
                        onChange={getParamsUpdater('masterNodes')}
                        isMaster
                      />

                      {/* Workloads on masters */}
                      <CheckboxField
                        id="allowWorkloadsOnMaster"
                        label="Allow workloads on master nodes"
                        info="It is highly recommended to not enable workloads on master nodes for production or critical workload clusters."
                      />
                    </>
                  )}
                </ValidatedForm>
              </WizardStep>

              <WizardStep stepId="workers" label="Woker Nodes">
                <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                  {({ setFieldValue, values }) => (
                    <>
                      {/* Worker nodes */}
                      <ClusterHostChooser
                        id="workerNodes"
                        excludeList={wizardContext.masterNodes}
                      />
                    </>
                  )}
                </ValidatedForm>
              </WizardStep>

              <WizardStep stepId="network" label="Network Info">
                <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                  {({ setFieldValue, values }) => (
                    <>
                      <TextField
                        id="masterVipIpv4"
                        label="Virtual IP address for cluster"
                        info={
                          <div>
                            Specify the virtual IP address that will be used to provide access to
                            the API server endpoint for this cluster.
                            A virtual IP must be specified if you want to grow the number of masters
                            in the future.
                            Refer
                            to <a href="https://docs.platform9.com/support/ha-for-baremetal-multimaster-kubernetes-cluster-service-type-load-balancer/" target="_blank">this
                            article</a>
                            for more information re how the VIP service operates, VIP configuration,
                            etc.
                          </div>
                        }
                        required={params.masterNodes && params.masterNodes.length > 1}
                      />

                      <PicklistField
                        DropdownComponent={VipInterfaceChooser}
                        id="masterVipIface"
                        label="Physical interface for virtual IP association"
                        info="Provide the name of the network interface that the virtual IP should be bound to. The virtual IP should be reachable from the network this interface connects to. Note: All master nodes should use the same interface (eg: ens3) that the virtual IP will be bound to."
                        masterNodes={params.masterNodes}
                        required
                      />

                      {/* Assign public IP's */}
                      <CheckboxField
                        id="enableMetallb"
                        label="Enable MetalLB"
                        info="Select if MetalLB should load-balancer should be enabled for this cluster. Platform9 uses MetalLB - a load-balancer implementation for bare metal Kubernetes clusters that uses standard routing protocols - for service level load balancing. Enabling MetalLB on this cluster will provide the ability to create services of type load-balancer."
                      />

                      {values.enableMetallb &&
                      <TextField
                        id="metallbCidr"
                        label="Address pool range(s) for Metal LB"
                        info="Provide the IP address pool that MetalLB load-balancer is allowed to allocate from. You need to specify an explicit start-end range of IPs for the pool.  It takes the following format: startIP1-endIP1,startIP2-endIP2"
                        required
                      />
                      }

                      {/* API FQDN */}
                      <TextField
                        id="externalDnsName"
                        label="API FQDN"
                        info="FQDN used to reference cluster API. To ensure the API can be accessed securely at the FQDN, the FQDN will be included in the API server certificate's Subject Alt Names. If deploying onto AWS, we will automatically create the DNS records for this FQDN into AWS Route 53."
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
                        info="Specify the HTTP proxy for this cluster.  Leave blank for none.  Uses format of <scheme>://<username>:<password>@<host>:<port> where <username>:<password>@ is optional."
                      />
                      <PicklistField
                        id="networkPlugin"
                        label="Network backend"
                        options={networkPluginOptions}
                        info=""
                        required
                      />
                      {values.networkPlugin === 'calico' &&
                      <TextField
                        id="mtuSize"
                        label="MTU Size"
                        info="Maximum Transmission Unit (MTU) for the interface (in bytes)"
                        required
                      />
                      }
                    </>
                  )}
                </ValidatedForm>
              </WizardStep>

              <WizardStep stepId="advanced" label="Advanced Configuration">
                <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                  {({ setFieldValue, values }) => (
                    <>
                      {/* Privileged */}
                      <CheckboxField
                        id="privileged"
                        label="Privileged"
                        value={values.privileged || ['calico', 'canal', 'weave'].includes(wizardContext.networkPlugin)}
                        disabled={['calico', 'canal', 'weave'].includes(wizardContext.networkPlugin)}
                        info="Allows this cluster to run privileged containers. Read this article for more information."
                      />

                      {/* Advanced API Configuration */}
                      <PicklistField
                        id="runtimeConfigOption"
                        label="Advanced API Configuration"
                        options={runtimeConfigOptions}
                        info="Make sure you are familiar with the Kubernetes API configuration documentation before enabling this option."
                        required
                      />

                      {values.runtimeConfigOption === 'custom' &&
                      <TextField
                        id="customRuntimeConfig"
                        label="Custom API Configuration"
                        info=""
                      />
                      }

                      {/* Enable Application Catalog */}
                      <CheckboxField
                        id="appCatalogEnabled"
                        label="Enable Application Catalog"
                        info="Enable the Helm Application Catalog on this cluster"
                      />

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

              <WizardStep stepId="review" label="Review">
                <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                  <BareOsClusterReviewTable data={wizardContext} />
                </ValidatedForm>
              </WizardStep>
            </>
          )
        }}
      </Wizard>
    </FormWrapper>
  )
}

export default AddBareOsClusterPage
