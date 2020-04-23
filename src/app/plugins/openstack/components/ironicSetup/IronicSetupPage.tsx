import React, { useEffect, useState } from 'react'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import DownloadHostAgentWalkthrough from 'openstack/components/hosts/DownloadHostAgentWalkthrough'
import BareMetalNetworkStep from './BareMetalNetworkStep'
import AuthorizeHostStep from './AuthorizeHostStep'
import ControllerConfigStep from './ControllerConfigStep'
import BareMetalSubnetStep from './BareMetalSubnetStep'
import OpenStackRcStep from './OpenStackRcStep'
import SummaryStep from './SummaryStep'
import { getService, getRole } from 'openstack/components/resmgr/actions'
import { path, intersection } from 'ramda'
import networkActions from 'openstack/components/networks/actions'
import subnetActions from 'openstack/components/networks/subnets/actions'
import useDataLoader from 'core/hooks/useDataLoader'
import { loadResMgrHosts } from 'k8s/components/infrastructure/common/actions'
import { clarityDashboardUrl } from 'app/constants'
import FormWrapperDefault from 'core/components/FormWrapper'
const FormWrapper: any = FormWrapperDefault // types on forward ref .js file dont work well.

// Wizard defaults (will be replaced with existing values from API later)
const initialContext:any = {
  imageStoragePath: '/var/opt/pf9/imagelibrary/data',
  hostImages: true,
}

const submitLastStep = (params) => {
  // This function should route them back to the old UI
  window.location.href = clarityDashboardUrl
}

const getProvisioningNetwork = (networks) => (
  networks.find(network => (
    network['provider:physical_network'] === 'provisioning'
  ))
)

// bridgeMappings looks like 'provisioning:pf9-br,external:pf9-ext'
const getProvisioningBridge = (bridgeMappings) => {
  const mappings = bridgeMappings.split(',')
  const provisioningMapping = mappings.find(mapping => (
    mapping.includes('provisioning')
  ))
  return provisioningMapping.split(':')[1]
}

// Check for presence of provisioning network as well as neutron-server configured
const networkConfigured = async (networks) => {
  const neutronServerResponse = await getService('neutron-server')
  const dnsDomain = path(['neutron', 'DEFAULT', 'dns_domain'], neutronServerResponse)
  const dnsForwardingAddresses = path(['extra', 'dnsmasq_dns_servers'], neutronServerResponse)
  const alreadyConfigured = path(['extra', 'configured'], neutronServerResponse)
  const provisioningNetwork = getProvisioningNetwork(networks)

  if (alreadyConfigured && provisioningNetwork) {
    initialContext.provisioningNetwork = provisioningNetwork.id
    initialContext.dnsDomain = dnsDomain
    initialContext.dnsForwardingAddresses = dnsForwardingAddresses
    initialContext.networkName = provisioningNetwork?.name
    initialContext.networkTenant = provisioningNetwork?.project_id
    return true
  }

  return false
}

const nodeAdded = hosts => hosts.length

// Check for presence of all roles other than glance (optional)
const nodeAuthorized = async (hosts) => {
  const ironicController = hosts.find((host) => {
    return intersection(host.roles, ['pf9-neutron-base',
      'pf9-ostackhost-neutron-ironic',
      'pf9-ironic-conductor',
      'pf9-ironic-inspector',
      'pf9-neutron-dhcp-agent',
      'pf9-neutron-metadata-agent',
      'pf9-neutron-l3-agent',
      'pf9-neutron-ovs-agent',
    ]).length === 8
  })

  if (ironicController) {
    const { dnsmasq_interface, tftp_server_ip } = await getRole(ironicController.id, 'pf9-ironic-inspector')
    const { bridge_mappings } = await getRole(ironicController.id, 'pf9-neutron-ovs-agent')
    const provisioningBridge = getProvisioningBridge(bridge_mappings)
    initialContext.selectedHost = [ironicController]
    initialContext.dnsmasq = `${dnsmasq_interface}: ${tftp_server_ip}`
    initialContext.bridgeDevice = provisioningBridge

    // No guarantee that glance role was authorized
    try {
      const { filesystem_store_datadir } = await getRole(ironicController.id, 'pf9-glance-role')
      initialContext.imageStoragePath = filesystem_store_datadir
      initialContext.hostImages = true
    } catch {
      initialContext.hostImages = false
    } finally {
      return true
    }
  }

  return false
}

// Check for a subnet in provisioning network
const subnetExists = (networks, subnets) => {
  const provisioningNetwork = getProvisioningNetwork(networks)
  const provisioningSubnet = subnets.find((subnet) => (
    subnet.network_id === provisioningNetwork.id
  ))

  if (provisioningSubnet) {
    const allocationPoolsString = provisioningSubnet.allocation_pools.map((pool) => (
      `${pool.start} - ${pool.end}`
    )).join(', ')

    initialContext.subnetName = provisioningSubnet.name
    initialContext.networkAddress = provisioningSubnet.cidr
    initialContext.allocationPools = allocationPoolsString
    initialContext.dnsNameServers = provisioningSubnet.dns_nameservers.join(', ')
    return true
  }

  return false
}

const IronicSetupPage = () => {
  const [networks, networksLoading] = useDataLoader(networkActions.list)
  const [subnets, subnetsLoading] = useDataLoader(subnetActions.list)
  const [hosts, hostsLoading] = useDataLoader(loadResMgrHosts)
  const [startingStep, setStartingStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submittingStep, setSubmittingStep] = useState(false)

  // Determine current step
  useEffect(() => {
    if (!networksLoading && !hostsLoading && !subnetsLoading) {
      (async () => {
        const finishedStep1 = await networkConfigured(networks)
        if (!finishedStep1) {
          setStartingStep(0)
          setLoading(false)
          return
        }
        const finishedStep2 = nodeAdded(hosts)
        if (!finishedStep2) {
          setStartingStep(1)
          setLoading(false)
          return
        }
        // No need to check step 3 because step 3 and 4 are connected
        const finishedStep4 = await nodeAuthorized(hosts)
        if (!finishedStep4) {
          setStartingStep(2)
          setLoading(false)
          return
        }
        const finishedStep5 = subnetExists(networks, subnets)
        if (!finishedStep5) {
          setStartingStep(4)
          setLoading(false)
          return
        }
        // Backend needs to be in place to see whether the wizard is completed
        // Currently the furthest the UI can track is to step 5
        setStartingStep(5)
        setLoading(false)
        return
      })()
    }
  }, [networks, networksLoading, hosts, hostsLoading, subnets, subnetsLoading])

  return (
    <FormWrapper
      title="Welcome to Platform9 Managed MetalStack"
      loading={submittingStep || loading }
      message={loading ? 'Loading...' : 'Submitting...'}
    >
      {/* Wrap this in loading, initialContext needs to be populated  */}
      {!loading && <Wizard
        onComplete={submitLastStep}
        context={initialContext}
        startingStep={startingStep}
      >
        {({ wizardContext, setWizardContext, onNext }) => {
          return (
            <>
              <WizardStep stepId="step1" label="Configure Provisioning Network">
                <BareMetalNetworkStep
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                  onNext={onNext}
                  title="Configure Provisioning Network"
                  setSubmitting={setSubmittingStep}
                />
              </WizardStep>
              <WizardStep stepId="step2" label="Install Host Agent">
                <div>
                  Install the Platform9 Host Agent on the node that will become the controller
                  for MetalStack.
                </div>
                <DownloadHostAgentWalkthrough />
              </WizardStep>
              <WizardStep stepId="step3" label="Authorize Host Agent">
                <AuthorizeHostStep
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                  onNext={onNext}
                  title="Authorize Host Agent"
                />
              </WizardStep>
              <WizardStep stepId="step4" label="Configure Controller">
                <ControllerConfigStep
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                  onNext={onNext}
                  title="Configure Controller"
                  setSubmitting={setSubmittingStep}
                />
              </WizardStep>
              <WizardStep stepId="step5" label="Bare Metal Subnet">
                <BareMetalSubnetStep
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                  onNext={onNext}
                  title="Bare Metal Subnet"
                  setSubmitting={setSubmittingStep}
                />
              </WizardStep>
              <WizardStep stepId="step6" label="Configure MetalStack">
                <OpenStackRcStep />
              </WizardStep>
              <WizardStep stepId="step7" label="Summary">
                <SummaryStep wizardContext={wizardContext} />
              </WizardStep>
            </>
          )
        }}
      </Wizard>}
    </FormWrapper>
  )
}

export default IronicSetupPage
