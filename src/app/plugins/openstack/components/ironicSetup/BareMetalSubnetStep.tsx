import React from 'react'
import TextField from 'core/components/validatedForm/TextField'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { makeStyles } from '@material-ui/styles'
import { Theme, Typography } from '@material-ui/core'
import clsx from 'clsx'
import useDataLoader from 'core/hooks/useDataLoader'
import networkActions from 'openstack/components/networks/actions'
import { createSubnet } from 'openstack/components/networks/subnets/actions'
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

// Allocation pools string expected to be like
// 1.1.1.1 - 1.1.1.100, 2.2.2.2 - 2.2.2.100 (comma separated)
const allocationPoolsValue = (string) => {
  const parts = string.split(',')
  return parts.map((part) => {
    const ips = part.split('-')
    return {
      start: ips[0].trim(),
      end: ips[1].trim(),
    }
  })
}

// Split into an array, string expected to be comma separated
const dnsNameServersValue = (string) => (
  string.split(',').map(ip => ip.trim())
)

const BareMetalSubnetStep = ({ wizardContext, setWizardContext, onNext, title, setSubmitting }: Props) => {
  const { text, bold } = useStyles({})
  const showToast = useToast()

  const [networks, networksLoading] = useDataLoader(networkActions.list)
  const provisioningNetwork = networks.find((network) => (
    network['provider:physical_network'] === 'provisioning'
  ))

  const submitStep = async (context) => {
    try {
      setSubmitting(true)
      await createSubnet({
        name: context.subnetName,
        network_id: provisioningNetwork.id,
        tenant_id: provisioningNetwork.project_id,
        ip_version: 4,
        cidr: context.networkAddress,
        enable_dhcp: true,
        gateway_ip: context.disableGateway ? null : context.gatewayIp,
        allocation_pools: allocationPoolsValue(context.allocationPools),
        dns_nameservers: dnsNameServersValue(context.dnsNameServers),
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
      title="Bare Metal Subnet"
      loading={networksLoading}
    >
      {({ setFieldValue, values }) => (
        <>
          <Typography className={text}>
            Configure the subnet to be created on the provisioning network.
          </Typography>

          <Typography className={clsx(text, bold)}>
            Subnet Settings
          </Typography>

          {/* Subnet Name */}
          <TextField
            id="subnetName"
            label="Subnet Name"
            required
          />

          {/* Network Address */}
          <TextField
            id="networkAddress"
            label="Network Address (CIDR)"
            info="Specify your network CIDR used to designate your IP address pool (e.g., 192.0.2.0/24)."
            required
          />

          {/* Gateway IP */}
          {!values.disableGateway && <TextField
            id="gatewayIp"
            label="Gateway IP"
            info="Specify the IP address used for the network gateway. If left blank, the first available IP address within your network CIDR will be automatically chosen."
          />}

          {/* Disable Gateway */}
          <CheckboxField
            id="disableGateway"
            label="Disable Gateway"
            info="By checking this option, no network gateway will be created. You may choose to add one later in the subnet edit form."
          />

          {/* Allocation Pools */}
          <TextField
            id="allocationPools"
            label="Allocation Pools"
            info="Specify the allocation pools that will be used to select new IP addresses from. These must be inside the range of the network's CIDR, and cannot conflict with the network's network address, broadcast address, or gateway IP. You may designate your allocation pools using the format allocation_pool_start - allocation_pool_end, with multiple entries separated by commas."
            multiline
            rows="3"
            required
          />

          {/* DNS Name Servers */}
          <TextField
            id="dnsNameServers"
            label="DNS Name Servers"
            info="Specify the IP addresses that will be used as DNS name servers for this subnet, separated by commas."
            multiline
            rows="3"
          />
        </>
      )}
    </ValidatedForm>
  )
}

export default BareMetalSubnetStep
