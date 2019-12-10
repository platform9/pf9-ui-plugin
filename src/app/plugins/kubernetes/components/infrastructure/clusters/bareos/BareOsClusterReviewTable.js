import React from 'react'
import { Table, TableBody, TableCell, TableRow, Typography } from '@material-ui/core'

import { loadNodes } from 'k8s/components/infrastructure/nodes/actions'
import useDataLoader from 'core/hooks/useDataLoader'

const DataRow = ({ label, value }) => (
  <TableRow>
    <TableCell>{label}</TableCell>
    <TableCell>
      {Array.isArray(value)
        ? value.map((val) => <Typography variant="body2">{val}</Typography>)
        : value}
    </TableCell>
  </TableRow>
)

const bool2str = (value) => (value ? 'true' : 'false')

const getFilteredNodesFormattedName = (nodes, filterList) =>
  nodes
    .filter((node) => filterList.includes(node.uuid))
    .map((node) => `${node.name} - ${node.primaryIp}`)

// TODO: azs, networking info, services/api FQDN auto-generate, MTU size
const BareOsClusterReviewTable = ({ data }) => {
  const [nodes] = useDataLoader(loadNodes)
  const masterNodes = getFilteredNodesFormattedName(nodes, data.masterNodes)
  const workerNodes = getFilteredNodesFormattedName(nodes, data.workerNodes)
  return (
    <Table>
      <TableBody>
        <DataRow label="Name" value={data.name} />
        <DataRow label="Master nodes" value={masterNodes} />
        <DataRow label="Worker nodes" value={workerNodes} />
        <DataRow label="Virtual IP address for cluster" value={data.masterVipIpv4} />
        <DataRow
          label="Physical interface for virtual IP association"
          value={data.masterVipIface}
        />
        <DataRow label="Enable MetalLB" value={bool2str(data.enableMetallb)} />
        {data.enableMetalLb && <DataRow label="MetalLB CIDR" value={data.metalLbCidr} />}
        <DataRow label="API FQDN" value={data.externalDnsName} />
        <DataRow label="Containers CIDR" value={data.containersCidr} />
        <DataRow label="Services CIDR" value={data.servicesCidr} />
        <DataRow label="Privileged" value={bool2str(data.privileged)} />
        <DataRow label="Enable application catalog" value={bool2str(data.appCatalogEnabled)} />
        <DataRow label="Tags" value={JSON.stringify(data.tags || [])} />
      </TableBody>
    </Table>
  )
}

export default BareOsClusterReviewTable
