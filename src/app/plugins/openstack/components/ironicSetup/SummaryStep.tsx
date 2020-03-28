import React from 'react'
import { Typography, Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import clsx from 'clsx'
import { hexToRGBA } from 'core/utils/colorHelpers'

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  paper: {
    // padding: theme.spacing(2, 8),
    margin: `${theme.spacing * 2}px, 1%`,
    backgroundColor: hexToRGBA(theme.palette.primary.main, 0.1),
    width: '31%',
    minWidth: '340px',
    flexGrow: 0,
  },
  text: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
  bold: {
    fontWeight: 'bold',
  }
}))

interface Props {
  wizardContext: any
}

const OpenStackRcStep = ({ wizardContext }: Props): JSX.Element => {
  const { container, text, bold, paper } = useStyles({})

  return (
    <div className={container}>
      <Paper className={paper} elevation={0}>
        <Typography variant="h6">Network Summary</Typography>
        <Typography className={clsx(text, bold)}>
          Bare Metal Cloud Network
        </Typography>
        <div>Network Name: {wizardContext.networkName}</div>
        <div>Connected to (Physical Network): {wizardContext.bridgeDevice}</div>
        <div>Connected Tenant: {wizardContext.networkTenant}</div>
        <Typography className={clsx(text, bold)}>
          Physical Properties
        </Typography>
        <div>DNS Domain: {wizardContext.dnsDomain}</div>
        <div>DNS Forwarding: {wizardContext.dnsForwardingAddresses}</div>
        <div>DHCP Servers: 1</div>
        <div>Network Type: Provider Network</div>
      </Paper>
      <Paper className={paper} elevation={0}>
        <Typography variant="h6">Conductor Summary</Typography>
        <div>Conductor Host Name: {wizardContext.selectedHost[0].info.hostname}</div>
        <div>Conductor OS: {wizardContext.selectedHost[0].info.os_info}</div>
        <div>Conductor IP: {wizardContext.dnsmasq[1]}</div>
        <div>Bare Metal Cloud Network: {wizardContext.bridgeDevice}</div>
      </Paper>
      <Paper className={paper} elevation={0}>
        <Typography variant="h6">Bare Metal Cloud IP Range Summary</Typography>
        <div>Total Available IPs: calculate from CIDR</div>
        <div>Network CIDR: {wizardContext.networkAddress}</div>
        <div>Network Range: {wizardContext.allocationPools}</div>
      </Paper>
    </div>
  )
}

export default OpenStackRcStep
