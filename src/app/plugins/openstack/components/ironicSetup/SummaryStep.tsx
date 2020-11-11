import React, { useEffect, useState, useMemo } from 'react'
import { Paper } from '@material-ui/core'
import Text from 'core/elements/text'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import { hexToRGBA } from 'core/utils/colorHelpers'
import { mngmTenantActions } from 'account/components/userManagement/tenants/actions'
import useDataLoader from 'core/hooks/useDataLoader'
import networkActions, { networkIpAvailability } from 'openstack/components/networks/actions'
import clsx from 'clsx'

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  paper: {
    // padding: theme.spacing(2, 8),
    margin: '8px 1%',
    backgroundColor: hexToRGBA(theme.palette.primary.main, 0.1),
    width: '31%',
    minWidth: '340px',
    flexGrow: 0,
  },
  card: {
    padding: '20px',
  },
  header: {
    marginBottom: theme.spacing(2),
  },
  subheader: {
    margin: theme.spacing(2, 0),
    fontWeight: 'bold',
  },
  field: {
    marginTop: theme.spacing(1),
    display: 'flex',
    justifyContent: 'space-between',
  },
  light: {
    color: theme.palette.grey['700'],
  },
}))

interface Props {
  wizardContext: any
}

const OpenStackRcStep = ({ wizardContext }: Props): JSX.Element => {
  const { container, field, light, header, subheader, paper, card } = useStyles({})
  const [tenantName, setTenantName] = useState('')
  const [availableIps, setAvailableIps] = useState('')
  const [tenants] = useDataLoader(mngmTenantActions.list)
  const [networks] = useDataLoader(networkActions.list)
  const provisioningNetwork = useMemo(
    () => networks.find((network) => network['provider:physical_network'] === 'provisioning'),
    [networks],
  )

  // Get provisioning network to check number of available IPs
  useEffect(() => {
    if (!provisioningNetwork) {
      return
    }

    ;(async () => {
      const ipInfo = await networkIpAvailability(provisioningNetwork.id)
      setAvailableIps(ipInfo.total_ips)
    })()
  }, [provisioningNetwork])

  // Get tenant name
  useEffect(() => {
    if (!tenants.length) {
      return
    }

    const networkTenant = tenants.find((tenant) => tenant.id === wizardContext.networkTenant)
    setTenantName(networkTenant?.name)
  }, [tenants])

  return (
    <div className={container}>
      <Paper className={paper} elevation={0}>
        <div className={card}>
          <Text variant="h6" className={clsx(light, header)}>
            Network Summary
          </Text>
          <Text className={subheader}>Bare Metal Cloud Network</Text>
          <div className={field}>
            <span className={light}>Network Name:</span>
            <span>{wizardContext.networkName}</span>
          </div>
          <div className={field}>
            <span className={light}>Connected to (Physical Network):</span>
            <span>{wizardContext.bridgeDevice}</span>
          </div>
          <div className={field}>
            <span className={light}>Connected Tenant:</span>
            <span>{tenantName}</span>
          </div>
          <Text className={subheader}>Physical Properties</Text>
          <div className={field}>
            <span className={light}>DNS Domain:</span>
            <span>{wizardContext.dnsDomain}</span>
          </div>
          <div className={field}>
            <span className={light}>DNS Forwarding:</span>
            <span>{wizardContext.dnsForwardingAddresses}</span>
          </div>
          <div className={field}>
            <span className={light}>DHCP Servers:</span>
            <span>1</span>
          </div>
          <div className={field}>
            <span className={light}>Network Type:</span>
            <span>Provider Network</span>
          </div>
        </div>
      </Paper>
      <Paper className={paper} elevation={0}>
        <div className={card}>
          <Text variant="h6" className={clsx(light, header)}>
            Controller Summary
          </Text>
          <div className={field}>
            <span className={light}>Controller Host Name:</span>
            <span>{wizardContext.selectedHost[0].info.hostname}</span>
          </div>
          <div className={field}>
            <span className={light}>Controller OS:</span>
            <span>{wizardContext.selectedHost[0].info.os_info}</span>
          </div>
          <div className={field}>
            <span className={light}>Controller IP:</span>
            <span>{wizardContext.dnsmasq.split(': ')[1]}</span>
          </div>
          <div className={field}>
            <span className={light}>Bare Metal Cloud Network:</span>
            <span>{wizardContext.bridgeDevice}</span>
          </div>
        </div>
      </Paper>
      <Paper className={paper} elevation={0}>
        <div className={card}>
          <Text variant="h6" className={clsx(light, header)}>
            Bare Metal Cloud IP Range Summary
          </Text>
          <div className={field}>
            <span className={light}>Total Available IPs:</span>
            <span>{availableIps}</span>
          </div>
          <div className={field}>
            <span className={light}>Network CIDR:</span>
            <span>{wizardContext.networkAddress}</span>
          </div>
          <div className={field}>
            <span className={light}>Network Range:</span>
            <span>{wizardContext.allocationPools}</span>
          </div>
        </div>
      </Paper>
    </div>
  )
}

export default OpenStackRcStep
