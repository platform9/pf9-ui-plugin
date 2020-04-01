import React, { useEffect, useState } from 'react'
import { Typography, Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import { hexToRGBA } from 'core/utils/colorHelpers'
import { mngmTenantActions } from 'k8s/components/userManagement/tenants/actions'
import useDataLoader from 'core/hooks/useDataLoader'

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
  const { container, field, light, subheader, paper, card } = useStyles({})
  const [tenantName, setTenantName] = useState('')
  const [tenants] = useDataLoader(mngmTenantActions.list)

  useEffect(() => {
    if (!tenants.length) {
      return
    }

    const networkTenant = tenants.find(tenant => (
      tenant.id === wizardContext.networkTenant
    ))
    setTenantName(networkTenant?.name)
  }, [tenants])

  return (
    <div className={container}>
      <Paper className={paper} elevation={0}>
        <div className={card}>
          <Typography variant="h6" className={light}>Network Summary</Typography>
          <Typography className={subheader}>
            Bare Metal Cloud Network
          </Typography>
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
          <Typography className={subheader}>
            Physical Properties
          </Typography>
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
          <Typography variant="h6" className={light}>Conductor Summary</Typography>
          <div className={field}>
            <span className={light}>Conductor Host Name:</span>
            <span>{wizardContext.selectedHost[0].info.hostname}</span>
          </div>
          <div className={field}>
            <span className={light}>Conductor OS:</span>
            <span>{wizardContext.selectedHost[0].info.os_info}</span>
          </div>
          <div className={field}>
            <span className={light}>Conductor IP:</span>
            <span>{wizardContext.dnsmasq[1]}</span>
          </div>
          <div className={field}>
            <span className={light}>Bare Metal Cloud Network:</span>
            <span>{wizardContext.bridgeDevice}</span>
          </div>
        </div>
      </Paper>
      <Paper className={paper} elevation={0}>
        <div className={card}>
          <Typography variant="h6" className={light}>Bare Metal Cloud IP Range Summary</Typography>
          <div className={field}>
            <span className={light}>Total Available IPs:</span>
            <span>calculate from CIDR</span>
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
