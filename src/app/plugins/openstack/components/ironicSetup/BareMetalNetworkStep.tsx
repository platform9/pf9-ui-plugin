// libs
import React from 'react'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import PicklistField from 'core/components/validatedForm/PicklistField'
import useParams from 'core/hooks/useParams'
import { makeStyles } from '@material-ui/styles'
import { Theme, Typography } from '@material-ui/core'
import clsx from 'clsx'
import { createNetwork } from 'openstack/components/networks/actions'
import TenantPicklist from 'openstack/components/common/TenantPicklist'
import { updateService } from 'openstack/components/resmgr/actions'
import { useToast } from 'core/providers/ToastProvider'
import { MessageTypes } from 'core/components/notifications/model'
import { sleep } from 'utils/misc'

const useStyles = makeStyles((theme: Theme) => ({
  text: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
  bold: {
    fontWeight: 'bold',
  }
}))

// Put any for now to let me proceed
interface Props {
  wizardContext: any
  setWizardContext: any
  onNext: any
  title: string
  setSubmitting: any
}

// Keep trying to create network every 5 seconds, retry if failed
const createNetworkLoop = async (body) => {
  try {
    await createNetwork(body)
  } catch {
    // Make this a util function
    await sleep(5000)
    await createNetworkLoop(body)
    return
  }
  return
}

const BareMetalNetworkStep = ({ wizardContext, setWizardContext, onNext, title, setSubmitting }: Props) => {
  const { getParamsUpdater } = useParams(wizardContext)
  const { text, bold } = useStyles({})
  const showToast = useToast()

  const submitStep = async (context) => {
    try {
      setSubmitting(true)
      const neutronServerBody = {
        ml2: {
          ml2: {
          type_drivers: 'flat,vlan',
          tenant_network_types: '',
          },
          ml2_type_vlan: {
            network_vlan_ranges: 'provisioning',
          },
          ml2_type_vxlan: {
            vni_ranges: 'PF9REMOVED',
          },
          ml2_type_gre: {
            tunnel_id_ranges: 'PF9REMOVED',
          },
        },
        neutron: {
          'DEFAULT': {
            router_distributed: false,
            dns_domain: context.dnsDomain,
            dhcp_agents_per_network: 1,
          },
        },
        extra: {
          dnsmasq_dns_servers: context.dnsForwardingAddresses.replace(/ /g, ''),
          configured: true,
        }
      }

      await updateService('neutron-server', neutronServerBody)
      await createNetworkLoop({
        name: context.networkName,
        project_id: context.networkTenant,
        'provider:network_type': 'flat',
        'provider:physical_network': 'provisioning',
        'router:external': false,
        admin_state_up: true,
        shared: true,
        port_security_enabled: false,
      })
    } catch (err) {
      setSubmitting(false)
      showToast(err.message, MessageTypes.error)
      return false
    }
    setSubmitting(false)
    return true
  }

  return (
    <ValidatedForm
      initialValues={wizardContext}
      onSubmit={setWizardContext}
      triggerSubmit={onNext}
      apiCalls={submitStep}
      title={title}
    >
      {({ setFieldValue, values }) => (
        <>
          <Typography className={text}>
            Configure the provisioning network that will be used to allocate IP addresses to deployed bare metal nodes.
          </Typography>
          <br />
          <Typography className={text}>
            Internally, Platform9 will deploy a flat, VLAN (untagged) virtual
            network with a DHCP server, that will be connected to your specified
            physical network.
          </Typography>
          <br />
          <Typography className={clsx(text, bold)}>
            Physical Network Properties
          </Typography>

          {/* DNS Domain */}
          <TextField
            id="dnsDomain"
            label="DNS Domain"
            info="This will be used by the DHCP server configured in the virtual network."
            required
          />

          {/* DNS Forwarding Addresses */}
          <TextField
            id="dnsForwardingAddresses"
            label="DNS Forwarding Addresses"
            multiline
            rows="3"
            required
          />
          <Typography className={clsx(text, bold)}>
            Bare Metal Virtual Network
          </Typography>

          {/* Network Name */}
          <TextField
            id="networkName"
            label="Network Name"
            info="Name of the virtual network to be created."
            required
          />

          {/* Network Tenant */}
          <PicklistField
            DropdownComponent={TenantPicklist}
            id="networkTenant"
            label="Tenant"
            onChange={getParamsUpdater('networkTenant')}
            info="Tenant that the virtual network should be created within."
            showAll={false}
            required
          />
        </>
      )}
    </ValidatedForm>
  )
}

export default BareMetalNetworkStep
