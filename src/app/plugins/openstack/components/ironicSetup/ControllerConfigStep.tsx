import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import TextField from 'core/components/validatedForm/TextField'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import PicklistField from 'core/components/validatedForm/PicklistField'
import { makeStyles } from '@material-ui/styles'
import Text from 'core/elements/text'
import DnsmasqPicklist from './DnsmasqPicklist'
import BridgeDevicePicklist from './BridgeDevicePicklist'
import { addRole } from 'openstack/components/resmgr/actions'
import PresetField from 'core/components/PresetField'
import useDataLoader from 'core/hooks/useDataLoader'
import networkActions from 'openstack/components/networks/actions'
import Theme from 'core/themes/model'
import { notificationActions, NotificationType } from 'core/notifications/notificationReducers'
import { useDispatch } from 'react-redux'

const useStyles = makeStyles((theme: Theme) => ({
  subheader: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
    marginBottom: theme.spacing(2),
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

const ControllerConfigStep = ({
  wizardContext,
  setWizardContext,
  onNext,
  title,
  setSubmitting,
}: Props) => {
  const { subheader } = useStyles({})
  const dispatch = useDispatch()
  const validatorRef = useRef(null)

  const [networks] = useDataLoader(networkActions.list)
  const provisioningNetwork = useMemo(
    () => networks.find((network) => network['provider:physical_network'] === 'provisioning'),
    [networks],
  )
  const networkName = provisioningNetwork ? provisioningNetwork.name : ''

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
      const [bridgeDevice, controllerIp] = wizardContext.dnsmasq.split(': ')
      // neutron-base role has to go first
      const hostId = wizardContext.selectedHost[0].id
      await addRole(hostId, 'pf9-neutron-base', {})
      // I think the other ones can be done asynchronously in the background
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
        dnsmasq_dns_servers: wizardContext.dnsForwardingAddresses.replace(/ /g, ''),
        dns_domain: wizardContext.dnsDomain,
      })
      addRole(hostId, 'pf9-neutron-metadata-agent', {})
      addRole(hostId, 'pf9-neutron-l3-agent', {
        agent_mode: 'legacy',
      })
      addRole(hostId, 'pf9-neutron-ovs-agent', {
        allow_dhcp_vms: 'False',
        bridge_mappings: `provisioning:${wizardContext.bridgeDevice}`,
        enable_tunneling: 'False',
        tunnel_types: '',
        local_ip: '',
        net_type: 'vlan',
        enable_distributed_routing: 'False',
      })

      // Only submit glance role if making host an image library
      if (wizardContext.hostImages) {
        addRole(hostId, 'pf9-glance-role', {
          endpoint_address: controllerIp,
          filesystem_store_datadir: wizardContext.imageStoragePath,
          update_public_glance_endpoint: 'true',
        })
      }
    } catch (err) {
      setSubmitting(false)
      dispatch(
        notificationActions.registerNotification({
          title: 'Controller Config Error',
          message: err.message,
          type: NotificationType.error,
        }),
      )
      return false
    }

    setSubmitting(false)
    return true
    // wizardContext required as a dependency to notice changes in the form inputs
  }, [wizardContext, provisioningNetwork])

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
          <Text className={subheader}>Bare Metal Controller Details</Text>

          {/* Provisioning Network */}
          <PresetField label="Provisioning Network" value={networkName} />

          {/* DNSmasq Interface & IP */}
          <PicklistField
            DropdownComponent={DnsmasqPicklist}
            id="dnsmasq"
            label="DNSmasq Interface & IP"
            onChange={(value) => setWizardContext({ dnsmasq: value })}
            info="The interface and IP that will be used to discover and communicate with the bare metal nodes."
            hostId={wizardContext.selectedHost[0].id}
            value={wizardContext.dnsmasq}
            required
          />

          {/* Mapping Bridge Device */}
          <PicklistField
            DropdownComponent={BridgeDevicePicklist}
            id="bridgeDevice"
            label="Mapping Bridge Device"
            onChange={(value) => setWizardContext({ bridgeDevice: value })}
            info="The corresponding OVS bridge device that will be used to communicate with the bare metal nodes."
            hostId={wizardContext.selectedHost[0].id}
            value={wizardContext.bridgeDevice}
            required
          />

          {/* Host OS/App Images */}
          <CheckboxField
            id="hostImages"
            label="Also use this node to host operating system images"
            onChange={(value) => setWizardContext({ hostImages: value })}
            value={wizardContext.hostImages}
          />

          {/* Image Storage Path */}
          {values.hostImages && (
            <TextField
              id="imageStoragePath"
              label="Image Storage Path"
              onChange={(value) => setWizardContext({ imageStoragePath: value })}
              info="Specify the path on this node where the OS images are stored."
              value={wizardContext.imageStoragePath}
              required
            />
          )}
        </>
      )}
    </ValidatedForm>
  )
}

export default ControllerConfigStep
