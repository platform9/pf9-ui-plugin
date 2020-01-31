import React from 'react'
import { Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import { boolToFormattedText } from 'core/utils/renderHelpers'

const DataRow = ({ label, value }) => (
  <TableRow>
    <TableCell>{label}</TableCell>
    <TableCell>{value}</TableCell>
  </TableRow>
)

// TODO: azs, networking info, services/api FQDN auto-generate, MTU size
const AwsClusterReviewTable = ({ data }) => {
  const numWorkers = data.enableCAS ? `${data.numWorkers} - ${data.numMaxWorkers}` : data.numWorkers
  return (
    <React.Fragment>
      <Table>
        <TableBody>
          <DataRow label="Name" value={data.name} />
          <DataRow label="Region" value={data.region} />
          <DataRow label="Operating system" value={data.ami} />
          <DataRow label="Master node instance type" value={data.masterFlavor} />
          <DataRow label="Worker node instance type" value={data.workerFlavor} />
          <DataRow label="Auto scaling" value={boolToFormattedText(data.enableCAS)} />
          <DataRow label="Num master nodes" value={data.numMasters} />
          <DataRow label="Num worker nodes" value={numWorkers} />
          <DataRow label="SSH key" value={data.sshKey} />
          <DataRow label="Make all Master nodes Master + Worker" value={boolToFormattedText(data.allowWorkloadsOnMaster)} />
          <DataRow label="Containers CIDR" value={data.containersCidr} />
          <DataRow label="Services CIDR" value={data.servicesCidr} />
          <DataRow label="Network backend" value={data.networkPlugin} />
          <DataRow label="Privileged" value={boolToFormattedText(data.privileged)} />
          <DataRow label="Application catalog" value={boolToFormattedText(data.appCatalogEnabled)} />
          <DataRow label="Prometheus monitoring" value={boolToFormattedText(data.prometheusMonitoringEnabled)} />
          <DataRow label="Tags" value={JSON.stringify(data.tags || [])} />
        </TableBody>
      </Table>
    </React.Fragment>
  )
}

export default AwsClusterReviewTable
