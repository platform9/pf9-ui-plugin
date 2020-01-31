import React from 'react'
import { Table, TableBody, TableCell, TableRow, Typography } from '@material-ui/core'

import { loadNodes } from 'k8s/components/infrastructure/nodes/actions'
import useDataLoader from 'core/hooks/useDataLoader'
import CodeBlock from 'core/components/CodeBlock'
import { makeStyles } from '@material-ui/styles'
import { boolToFormattedText } from 'core/utils/renderHelpers'

const useStyles = makeStyles(theme => ({
  cell: {
    paddingRight: [theme.spacing(0.5), '!important'],
  },
}))

const DataRow = ({ label, value }) => {
  const classes = useStyles()
  return (
    <TableRow>
      <TableCell>{label}</TableCell>
      <TableCell className={classes.cell}>
        {Array.isArray(value)
          ? value.map((val, idx) => <Typography key={idx} variant="body2">{val}</Typography>)
          : value}
      </TableCell>
    </TableRow>
  )
}

const getFilteredNodesFormattedName = (nodes, filterList = []) =>
  nodes
    .filter((node) => filterList.includes(node.uuid))
    .map((node) => `${node.name} - ${node.primaryIp}`)

// TODO: azs, networking info, services/api FQDN auto-generate, MTU size
const BareOsClusterReviewTable = ({ data }) => {
  const [nodes] = useDataLoader(loadNodes)
  // TODO why are form elements undefined here? wtf.
  const masterNodes = getFilteredNodesFormattedName(nodes, data.masterNodes)
  const workerNodes = getFilteredNodesFormattedName(nodes, data.workerNodes)
  return (
    <Table>
      <TableBody>
        <DataRow label="Name" value={data.name} />
        <DataRow label={`Master${data.allowWorkloadsOnMaster ? ' + Worker' : ''} nodes`} value={masterNodes} />
        <DataRow label="Worker nodes" value={workerNodes} />
        <DataRow label="Virtual IP address for cluster" value={data.masterVipIpv4} />
        <DataRow
          label="Physical interface for virtual IP association"
          value={data.masterVipIface}
        />
        <DataRow label="MetalLB" value={boolToFormattedText(data.enableMetallb)} />
        {data.enableMetalLb && <DataRow label="MetalLB CIDR" value={data.metalLbCidr} />}
        <DataRow label="API FQDN" value={data.externalDnsName} />
        <DataRow label="Containers CIDR" value={data.containersCidr} />
        <DataRow label="Services CIDR" value={data.servicesCidr} />
        <DataRow label="Privileged" value={boolToFormattedText(data.privileged)} />
        <DataRow label="Application catalog" value={boolToFormattedText(data.appCatalogEnabled)} />
        <DataRow label="Prometheus monitoring" value={boolToFormattedText(data.prometheusMonitoringEnabled)} />
        <DataRow label="Tags" value={<CodeBlock>{JSON.stringify(data.tags || [], null, 2)}</CodeBlock>} />
      </TableBody>
    </Table>
  )
}

export default BareOsClusterReviewTable
