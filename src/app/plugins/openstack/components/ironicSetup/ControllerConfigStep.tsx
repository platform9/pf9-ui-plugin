// libs
import React from 'react'
import TextField from 'core/components/validatedForm/TextField'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import PicklistField from 'core/components/validatedForm/PicklistField'
import useParams from 'core/hooks/useParams'
import { makeStyles } from '@material-ui/styles'
import { Theme, Typography } from '@material-ui/core'
import clsx from 'clsx'
import ProvisioningNetworkPicklist from './ProvisioningNetworkPicklist'
import DnsmasqPicklist from './DnsmasqPicklist'
import BridgeDevicePicklist from './BridgeDevicePicklist'
import { addRole } from 'openstack/components/resmgr/actions'
import { useToast } from 'core/providers/ToastProvider'
import { MessageTypes } from 'core/components/notifications/model'

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

const ControllerConfigStep = ({ wizardContext, setWizardContext, onNext, title, setSubmitting }: Props) => {
  const { getParamsUpdater } = useParams(wizardContext)
  const { text, bold } = useStyles({})
  const showToast = useToast()

  const submitStep = async (context) => {
    try {
      setSubmitting(true)
      // neutron-base role has to go first
      const hostId = context.selectedHost[0].id
      await addRole(hostId, 'pf9-neutron-base', {})
      // I think the other ones can be done in the background
      addRole(hostId, 'pf9-ostackhost-neutron-ironic', {})
      addRole(hostId, 'pf9-ironic-conductor', {
        cleaning_network_uuid: context.provisioningNetwork,
        provisioning_network_uuid: context.provisioningNetwork,
        my_ip: context.dnsmasq[1],
      })
      addRole(hostId, 'pf9-ironic-inspector', {
        dnsmasq_interface: context.dnsmasq[0],
        tftp_server_ip: context.dnsmasq[1],
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
          endpoint_address: context.dnsmasq[1],
          filesystem_store_datadir: context.imageStoragePath,
          update_public_glance_endpoint: true,
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
          <Typography className={clsx(text, bold)}>
            Ironic Controller Details
          </Typography>

          {/* Provisioning Network */}
          <PicklistField
            DropdownComponent={ProvisioningNetworkPicklist}
            id="provisioningNetwork"
            label="Provisioning Network"
            onChange={getParamsUpdater('provisioningNetwork')}
            info="provisioning network help"
            required
          />

          {/* DNSmasq Interface & IP */}
          <PicklistField
            DropdownComponent={DnsmasqPicklist}
            id="dnsmasq"
            label="DNSmasq Interface & IP"
            onChange={getParamsUpdater('dnsmasq')}
            info="DNSMasq help"
            hostId={wizardContext.selectedHost[0].id}
            required
          />

          {/* Mapping Bridge Device */}
          <PicklistField
            DropdownComponent={BridgeDevicePicklist}
            id="bridgeDevice"
            label="Mapping Bridge Device"
            onChange={getParamsUpdater('bridgeDevice')}
            info="Mapping bridge device help"
            hostId={wizardContext.selectedHost[0].id}
            required
          />

          {/* Host OS/App Images */}
          <CheckboxField
            id="hostImages"
            label="Host OS/App Images"
            info="host images help"
          />

          {/* Image Storage Path */}
          {values.hostImages && <TextField
            id="imageStoragePath"
            label="Image Storage Path"
            info="storage path description"
            required
          />}
        </>
      )}
    </ValidatedForm>
  )
}

export default ControllerConfigStep
