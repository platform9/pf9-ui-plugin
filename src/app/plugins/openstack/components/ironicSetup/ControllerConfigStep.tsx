// libs
import React, { useMemo } from 'react'
import TextField from 'core/components/validatedForm/TextField'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import PicklistField from 'core/components/validatedForm/PicklistField'
import useParams from 'core/hooks/useParams'
import { makeStyles } from '@material-ui/styles'
import { Theme, Typography } from '@material-ui/core'
import DnsmasqPicklist from './DnsmasqPicklist'
import BridgeDevicePicklist from './BridgeDevicePicklist'
import { addRole } from 'openstack/components/resmgr/actions'
import { useToast } from 'core/providers/ToastProvider'
import { MessageTypes } from 'core/components/notifications/model'
import PresetField from 'core/components/PresetField'
import useDataLoader from 'core/hooks/useDataLoader'
import networkActions from 'openstack/components/networks/actions'

const useStyles = makeStyles((theme: Theme) => ({
  subheader: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
    marginBottom: theme.spacing(2),
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

const ControllerConfigStep = ({ wizardContext, setWizardContext, onNext, title, setSubmitting }: Props) => {
  const { getParamsUpdater } = useParams(wizardContext)
  const { subheader } = useStyles({})
  const showToast = useToast()

  const [networks] = useDataLoader(networkActions.list)
  const provisioningNetwork = useMemo(() => (
    networks.find((network) => (
      network['provider:physical_network'] === 'provisioning'
    ))
  ),
    [networks],
  )
  const networkName = provisioningNetwork ? provisioningNetwork.name : ''

  const submitStep = async (context) => {
    try {
      setSubmitting(true)
      const [bridgeDevice, controllerIp] = context.dnsmasq.split(': ')
      // neutron-base role has to go first
      const hostId = context.selectedHost[0].id
      await addRole(hostId, 'pf9-neutron-base', {})
      // I think the other ones can be done in the background
      addRole(hostId, 'pf9-ostackhost-neutron-ironic', {})
      addRole(hostId, 'pf9-ironic-conductor', {
        cleaning_network_uuid: provisioningNetwork.id,
        provisioning_network_uuid: provisioningNetwork.id,
        my_ip: controllerIp,
      })
      addRole(hostId, 'pf9-ironic-inspector', {
        dnsmasq_interface: bridgeDevice,
        tftp_server_ip: controllerIp,
      })
      addRole(hostId, 'pf9-neutron-dhcp-agent', {
        dnsmasq_dns_servers: context.dnsForwardingAddresses.replace(/ /g, ''),
        dns_domain: context.dnsDomain,
      })
      addRole(hostId, 'pf9-neutron-metadata-agent', {})
      addRole(hostId, 'pf9-neutron-l3-agent', {
        agent_mode: 'legacy',
      })
      addRole(hostId, 'pf9-neutron-ovs-agent', {
        allow_dhcp_vms: 'False',
        bridge_mappings: `provisioning:${context.bridgeDevice}`,
        enable_tunneling: 'False',
        tunnel_types: '',
        local_ip: '',
        net_type: 'vlan',
        enable_distributed_routing: 'False',
      })

      // Only submit glance role if making host an image library
      if (context.hostImages) {
        addRole(hostId, 'pf9-glance-role', {
          endpoint_address: controllerIp,
          filesystem_store_datadir: context.imageStoragePath,
          update_public_glance_endpoint: 'true',
        })
      }
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
          <Typography className={subheader}>
            MetalStack Controller Details
          </Typography>

          {/* Provisioning Network */}
          <PresetField label="Provisioning Network" value={networkName} />

          {/* DNSmasq Interface & IP */}
          <PicklistField
            DropdownComponent={DnsmasqPicklist}
            id="dnsmasq"
            label="DNSmasq Interface & IP"
            onChange={getParamsUpdater('dnsmasq')}
            info="The interface and IP that will be used to discover and communicate with the bare metal nodes."
            hostId={wizardContext.selectedHost[0].id}
            required
          />

          {/* Mapping Bridge Device */}
          <PicklistField
            DropdownComponent={BridgeDevicePicklist}
            id="bridgeDevice"
            label="Mapping Bridge Device"
            onChange={getParamsUpdater('bridgeDevice')}
            info="The corresponding OVS bridge device that will be used to communicate with the bare metal nodes."
            hostId={wizardContext.selectedHost[0].id}
            required
          />

          {/* Host OS/App Images */}
          <CheckboxField
            id="hostImages"
            label="Also use this node to host operating system images"
          />

          {/* Image Storage Path */}
          {values.hostImages && <TextField
            id="imageStoragePath"
            label="Image Storage Path"
            info="Specify the path on this node where the OS images are stored."
            required
          />}
        </>
      )}
    </ValidatedForm>
  )
}

export default ControllerConfigStep
