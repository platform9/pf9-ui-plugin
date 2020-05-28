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

  return {
    finished: alreadyConfigured && provisioningNetwork,
    step: 0,
    data: {
      provisioningNetwork: provisioningNetwork.id,
      dnsDomain: dnsDomain,
      dnsForwardingAddresses: dnsForwardingAddresses,
      networkName: provisioningNetwork?.name,
      networkTenant: provisioningNetwork?.project_id,
    },
  }
}

const nodeAdded = (hosts) => (
  {
    finished: hosts.length,
    step: 1,
    data: {},
  }
)

const onboardingRoleAdded = async (hosts) => {
  const onboardedHost = hosts.find((host) => (
    host.roles.includes('pf9-onboarding')
  ))
  return {
    finished: !!onboardedHost,
    step: 2,
    data: {},
  }
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

    // No guarantee that glance role was authorized
    try {
      const { filesystem_store_datadir } = await getRole(ironicController.id, 'pf9-glance-role')
      return {
        finished: true,
        step: 3,
        data: {
          selectedHost: [ironicController],
          dnsmasq: `${dnsmasq_interface}: ${tftp_server_ip}`,
          bridgeDevice: provisioningBridge,
          imageStoragePath: filesystem_store_datadir,
          hostImages: true,
        },
      }
    } catch {
      return {
        finished: true,
        step: 3,
        data: {
          selectedHost: [ironicController],
          dnsmasq: `${dnsmasq_interface}: ${tftp_server_ip}`,
          bridgeDevice: provisioningBridge,
          hostImages: false,
        },
      }
    }
  }

  return {
    finished: false,
    step: 3,
    data: {},
  }
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

    return {
      finished: true,
      step: 5,
      data: {
        subnetName: provisioningSubnet.name,
        networkAddress: provisioningSubnet.cidr,
        allocationPools: allocationPoolsString,
        dnsNameServers: provisioningSubnet.dns_nameservers.join(', '),
      }
    }
  }

  return {
    finished: false,
    step: 5,
    data: {},
  }
}

const ironicImagesExist = (images) => {
  const imageNames = images.map(image => image.name)
  return {
    finished: intersection(imageNames, [
      'tinyipa-deploy-initrd',
      'tinyipa-deploy-vmlinuz',
    ]).length === 2,
    step: 6,
    data: {},
  }
}

const SetupWizard = ({ initialContext, startingStep, setSubmittingStep }) => {
  const submitLastStep = (params) => {
    // This function should route them back to the old UI
    window.location.href = clarityDashboardUrl
  }

  return (
    <Wizard
      onComplete={submitLastStep}
      context={initialContext}
      startingStep={startingStep}
      hideBack={true}
    >
      {/* Hide back button, currently not fully supported */}
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
    </Wizard>
  )
}

const IronicSetupPage = () => {
  const [networks, networksLoading] = useDataLoader(networkActions.list)
  const [subnets, subnetsLoading] = useDataLoader(subnetActions.list)
  const [hosts, hostsLoading] = useDataLoader(loadResMgrHosts)
  const [images, imagesLoading] = useDataLoader(loadImages)
  const [startingStep, setStartingStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submittingStep, setSubmittingStep] = useState(false)
  const [initialContext, setInitialContext] = useState<any>({
    imageStoragePath: '/var/opt/pf9/imagelibrary/data',
    hostImages: true,
  })

  // Determine current step
  useEffect(() => {
    const determineStep = async () => {
      if (!networksLoading && !hostsLoading && !subnetsLoading && !imagesLoading) {
        // I think for this to work, I may need to implement it like before...
        // talk to john about the problem with using setState inside of the loop
        const { finished, step, data } = await networkConfigured(networks)
        if (!finished) {
          setStartingStep(step)
          setInitialContext({ ...initialContext, ...data })
          setLoading(false)
          return
        }

        const { finished: finished2, step: step2 } = await nodeAdded(hosts)
        if (!finished2) {
          setStartingStep(step2)
          setInitialContext({ ...initialContext, ...data })
          setLoading(false)
          return
        }

        const { finished: finished3, step: step3 } = await onboardingRoleAdded(hosts)
        if (!finished3) {
          setStartingStep(step3)
          setInitialContext({ ...initialContext, ...data })
          setLoading(false)
          return
        }

        const { finished: finished4, step: step4, data: data4 } = await nodeAuthorized(hosts)
        if (!finished4) {
          setStartingStep(step4)
          setInitialContext({ ...initialContext, ...data, ...data4 })
          setLoading(false)
          return
        }

        const { finished: finished5, step: step5, data: data5 } = await subnetExists(networks, subnets)
        if (!finished5) {
          setStartingStep(step5)
          setInitialContext({ ...initialContext, ...data, ...data4, ...data5 })
          setLoading(false)
          return
        }

        const { finished: finished6, step: step6 } = await ironicImagesExist(images)
        if (!finished6) {
          setStartingStep(step6)
          setLoading(false)
          setInitialContext({ ...initialContext, ...data, ...data4, ...data5 })
          return
        }

        setStartingStep(7)
        setInitialContext({ ...initialContext, ...data, ...data4, ...data5 })
        setLoading(false)
        return
      }
    }
    determineStep()
  }, [networks, networksLoading, hosts, hostsLoading, subnets, subnetsLoading, images, imagesLoading])

  return (
    <FormWrapper
      title="Welcome to Platform9 Managed Bare Metal"
      loading={submittingStep || loading }
      message={loading ? 'Loading...' : 'Submitting...'}
    >
      {/* Wrap this in loading, initialContext needs to be populated  */}
      {!loading && <SetupWizard
          initialContext={initialContext}
          startingStep={startingStep}
          setSubmittingStep={setSubmittingStep}
        />
      }
    </FormWrapper>
  )
}

export default IronicSetupPage
