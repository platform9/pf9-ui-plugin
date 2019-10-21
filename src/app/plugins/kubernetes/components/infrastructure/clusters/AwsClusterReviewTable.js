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
const AwsClusterReviewTable = ({ data }) => {
  return (
    <React.Fragment>
      <Table>
        <TableBody>
          <DataRow label="Name" value={data.name} />
          <DataRow label="Region" value={data.region} />
          <DataRow label="Operating system" value={data.ami} />
          <DataRow label="Master node instance type" value={data.masterFlavor} />
          <DataRow label="Num master nodes" value={data.numMasters} />
          <DataRow label="Worker node instance type" value={data.workerFlavor} />
          <DataRow label="Num worker nodes" value={data.numWorkers} />
          <DataRow label="SSH key" value={data.sshKey} />
          <DataRow label="Enable auto scaling" value={bool2str(data.enableCAS)} />
          <DataRow label="Allow workloads on master nodes" value={bool2str(data.allowWorkloadsOnMaster)} />
          <DataRow label="Containers CIDR" value={data.containersCidr} />
          <DataRow label="Services CIDR" value={data.servicesCidr} />
          <DataRow label="Network backend" value={data.networkPlugin} />
          <DataRow label="Privileged" value={bool2str(data.privileged)} />
          <DataRow label="Enable application catalog" value={bool2str(data.appCatalogEnabled)} />
          <DataRow label="Tags" value={JSON.stringify(data.tags || [])} />
        </TableBody>
      </Table>
    </React.Fragment>
  )
}

export default AwsClusterReviewTable
