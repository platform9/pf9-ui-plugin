import React, { useCallback, useEffect, useRef } from 'react'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import PicklistField from 'core/components/validatedForm/PicklistField'
import { makeStyles } from '@material-ui/styles'
import Text from 'core/elements/text'
import clsx from 'clsx'
import { createNetwork } from 'openstack/components/networks/actions'
import TenantPicklist from 'openstack/components/common/TenantPicklist'
import { updateService } from 'openstack/components/resmgr/actions'
import { sleep } from 'utils/async'
import Theme from 'core/themes/model'
import { notificationActions, NotificationType } from 'core/notifications/notificationReducers'
import { useDispatch } from 'react-redux'

const useStyles = makeStyles((theme: Theme) => ({
  text: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
  bold: {
    fontWeight: 'bold',
  },
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
    await sleep(5000)
    await createNetworkLoop(body)
  }
}

const BareMetalNetworkStep = ({
  wizardContext,
  setWizardContext,
  onNext,
  title,
  setSubmitting,
}: Props) => {
  const { text, bold } = useStyles({})
  const dispatch = useDispatch()
  const validatorRef = useRef(null)

  const setupValidator = (validate) => {
    validatorRef.current = { validate }
  }

  const submitStep = useCallback(async () => {
    const isValid = validatorRef.current.validate()
    if (!isValid) {
      // don't let the user progress to next step
      return false
    }

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
          DEFAULT: {
            router_distributed: false,
            dns_domain: wizardContext.dnsDomain,
            dhcp_agents_per_network: 1,
          },
        },
        extra: {
          dnsmasq_dns_servers: wizardContext.dnsForwardingAddresses.replace(/ /g, ''),
          configured: true,
        },
      }

      await updateService('neutron-server', neutronServerBody)
      await createNetworkLoop({
        name: wizardContext.networkName,
        project_id: wizardContext.networkTenant,
        'provider:network_type': 'flat',
        'provider:physical_network': 'provisioning',
        'router:external': false,
        admin_state_up: true,
        shared: true,
        port_security_enabled: false,
      })
    } catch (err) {
      setSubmitting(false)
      dispatch(
        notificationActions.registerNotification({
          title: 'Bare Metal Network Error',
          message: err.message,
          type: NotificationType.error,
        }),
      )
      return false
    }
    setSubmitting(false)
    return true
  }, [wizardContext])

  useEffect(() => {
    onNext(submitStep)
  }, [submitStep])

  return (
    <ValidatedForm
      initialValues={wizardContext}
      onSubmit={setWizardContext}
      triggerSubmit={setupValidator}
      title={title}
    >
      {({ setFieldValue, values }) => (
        <>
          <Text className={text}>
            Configure the provisioning network that will be used to allocate IP addresses to
            deployed bare metal nodes.
          </Text>
          <br />
          <Text className={text}>
            Internally, Platform9 will deploy a flat, VLAN (untagged) virtual network with a DHCP
            server, that will be connected to your specified physical network.
          </Text>
          <br />
          <Text className={clsx(text, bold)}>Physical Network Properties</Text>

          {/* DNS Domain */}
          <TextField
            id="dnsDomain"
            label="DNS Domain"
            onChange={(value) => setWizardContext({ dnsDomain: value })}
            value={wizardContext.dnsDomain}
            info="This will be used by the DHCP server configured in the virtual network."
            required
          />

          {/* DNS Forwarding Addresses */}
          <TextField
            id="dnsForwardingAddresses"
            label="DNS Forwarding Addresses"
            onChange={(value) => setWizardContext({ dnsForwardingAddresses: value })}
            value={wizardContext.dnsForwardingAddresses}
            multiline
            rows="3"
            required
          />
          <Text className={clsx(text, bold)}>Bare Metal Virtual Network</Text>

          {/* Network Name */}
          <TextField
            id="networkName"
            label="Network Name"
            onChange={(value) => setWizardContext({ networkName: value })}
            value={wizardContext.networkName}
            info="Name of the virtual network to be created."
            required
          />

          {/* Network Tenant */}
          <PicklistField
            DropdownComponent={TenantPicklist}
            id="networkTenant"
            label="Tenant"
            onChange={(value) => setWizardContext({ networkTenant: value })}
            value={wizardContext.networkTenant}
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
