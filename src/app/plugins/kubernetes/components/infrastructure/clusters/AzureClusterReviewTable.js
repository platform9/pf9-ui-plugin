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
const AzureClusterReviewTable = ({ data }) => {
  return (
    <React.Fragment>
      <Table>
        <TableBody>
          <DataRow label="Name" value={data.name} />
          <DataRow label="Region" value={data.location} />
          <DataRow label="Master node SKU" value={data.masterSku} />
          <DataRow label="Worker node SKU" value={data.workerSku} />
          <DataRow label="Num master nodes" value={data.numMasters} />
          <DataRow label="Num worker nodes" value={data.numWorkers} />
          <DataRow label="SSH key" value={data.sshKey} />
          <DataRow label="Allow workloads on master nodes" value={bool2str(data.allowWorkloadsOnMaster)} />
          <DataRow label="Assign public IP's" value={bool2str(data.assignPublicIps)} />
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

export default AzureClusterReviewTable
