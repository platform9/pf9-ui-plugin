import React, { useEffect, useState } from 'react'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import DownloadHostAgentWalkthrough from 'openstack/components/hosts/DownloadHostAgentWalkthrough'
import BareMetalNetworkStep from './BareMetalNetworkStep'
import AuthorizeHostStep from './AuthorizeHostStep'
import ControllerNetworkingStep from './ControllerNetworkingStep'
import ControllerConfigStep from './ControllerConfigStep'
import BareMetalSubnetStep from './BareMetalSubnetStep'
import OpenStackRcStep from './OpenStackRcStep'
import SummaryStep from './SummaryStep'
import { getService, getRole } from 'openstack/components/resmgr/actions'
import { path, intersection } from 'ramda'
import networkActions from 'openstack/components/networks/actions'
import subnetActions from 'openstack/components/networks/subnets/actions'
import { loadImages } from 'openstack/components/images/actions'
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

const onboardingRoleAdded = async (hosts) => {
  const onboardedHost = hosts.find((host) => (
    host.roles.includes('pf9-onboarding')
  ))
  return !!onboardedHost
}

// Check for presence of all roles other than glance (optional)
const nodeAuthorized = async (hosts) => {
  const ironicController = hosts.find((host) => {
    return intersection(host.roles, [
      'pf9-neutron-base',
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

const ironicImagesExist = (images) => {
  const imageNames = images.map(image => image.name)
  return intersection(imageNames, [
    'tinyipa-deploy-initrd',
    'tinyipa-deploy-vmlinuz',
  ]).length === 2
}

const IronicSetupPage = () => {
  const [networks, networksLoading] = useDataLoader(networkActions.list)
  const [subnets, subnetsLoading] = useDataLoader(subnetActions.list)
  const [hosts, hostsLoading] = useDataLoader(loadResMgrHosts)
  const [images, imagesLoading] = useDataLoader(loadImages)
  const [startingStep, setStartingStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submittingStep, setSubmittingStep] = useState(false)

  // Determine current step
  useEffect(() => {
    if (!networksLoading && !hostsLoading && !subnetsLoading && !imagesLoading) {
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

        const finishedStep3 = await onboardingRoleAdded(hosts)
        if (!finishedStep3) {
          setStartingStep(2)
          setLoading(false)
          return
        }

        // No need to check step 4, no way to check if completed
        const finishedStep5 = await nodeAuthorized(hosts)
        if (!finishedStep5) {
          setStartingStep(3)
          setLoading(false)
          return
        }
        const finishedStep6 = subnetExists(networks, subnets)
        if (!finishedStep6) {
          setStartingStep(5)
          setLoading(false)
          return
        }
        const finishedStep7 = ironicImagesExist(images)
        if (!finishedStep7) {
          setStartingStep(6)
          setLoading(false)
          return
        }
        setStartingStep(7)
        setLoading(false)
        return
      })()
    }
  }, [networks, networksLoading, hosts, hostsLoading, subnets, subnetsLoading, images, imagesLoading])

  return (
    <FormWrapper
      title="Welcome to Platform9 Managed Bare Metal"
      loading={submittingStep || loading }
      message={loading ? 'Loading...' : 'Submitting...'}
    >
      {/* Wrap this in loading, initialContext needs to be populated  */}
      {/* Hide back button, currently not fully supported */}
      {!loading && <Wizard
        onComplete={submitLastStep}
        context={initialContext}
        startingStep={startingStep}
        // hideBack={true}
      >
        {({ wizardContext, setWizardContext, onNext }) => {
          return (
            <>

              {/*
                keepContentMounted={false} is required due to the useEffects
                used in the step components that call onNext. If kept false,
                the onEffect will trigger again on other steps and things
                start breaking.
              */}

              <WizardStep stepId="step1" label="Configure Provisioning Network" keepContentMounted={false}>
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
                  for Bare Metal.
                </div>
                <DownloadHostAgentWalkthrough />
              </WizardStep>
              <WizardStep stepId="step3" label="Authorize Host Agent" keepContentMounted={false}>
                <AuthorizeHostStep
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                  onNext={onNext}
                  title="Authorize Host Agent"
                  setSubmitting={setSubmittingStep}
                />
              </WizardStep>
              <WizardStep stepId="step4" label="Controller Networking Configuration">
                <ControllerNetworkingStep
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                  onNext={onNext}
                  title="Controller Networking Configuration"
                />
              </WizardStep>

              <WizardStep stepId="step5" label="Configure Controller" keepContentMounted={false}>
                <ControllerConfigStep
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                  onNext={onNext}
                  title="Configure Controller"
                  setSubmitting={setSubmittingStep}
                />
              </WizardStep>
              <WizardStep stepId="step6" label="Bare Metal Subnet" keepContentMounted={false}>
                <BareMetalSubnetStep
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                  onNext={onNext}
                  title="Bare Metal Subnet"
                  setSubmitting={setSubmittingStep}
                />
              </WizardStep>
              <WizardStep stepId="step7" label="Configure Bare Metal">
                <OpenStackRcStep />
              </WizardStep>
              <WizardStep stepId="step8" label="Summary">
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
