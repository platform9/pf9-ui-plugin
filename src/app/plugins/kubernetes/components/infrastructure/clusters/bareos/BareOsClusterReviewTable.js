import React from 'react'
import { Table, TableBody, TableCell, TableRow } from '@material-ui/core'

const DataRow = ({ label, value }) => (
  <TableRow>
    <TableCell>{label}</TableCell>
    <TableCell>{value}</TableCell>
  </TableRow>
)

const bool2str = value => value ? 'true' : 'false'

// TODO: azs, networking info, services/api FQDN auto-generate, MTU size
const BareOsClusterReviewTable = ({ data }) => {
  return (
    <React.Fragment>
      <Table>
        <TableBody>
          <DataRow label="Name" value={data.name} />
          <DataRow label="Master nodes" value={'TODO'} />
          <DataRow label="Worker nodes" value={'TODO'} />
          <DataRow label="Virtual IP address for cluster" value={data.masterVipIpv4} />
          <DataRow label="Physical interface for virtual IP association" value={data.masterVipIface} />
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
    </React.Fragment>
  )
}

export default BareOsClusterReviewTable
