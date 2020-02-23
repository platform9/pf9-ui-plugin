import React from 'react'
import { Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import { castBoolToStr } from 'utils/misc'
import CodeBlock from 'core/components/CodeBlock'

const DataRow = ({ label, value }) => (
  <TableRow>
    <TableCell>{label}</TableCell>
    <TableCell>{value}</TableCell>
  </TableRow>
)

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
          <DataRow
            label="Enable workloads on all master nodes"
            value={castBoolToStr()(data.allowWorkloadsOnMaster)}
          />
          <DataRow label="Assign public IP's" value={castBoolToStr()(data.assignPublicIps)} />
          <DataRow label="Containers CIDR" value={data.containersCidr} />
          <DataRow label="Services CIDR" value={data.servicesCidr} />
          <DataRow label="Privileged" value={castBoolToStr()(data.privileged)} />
          <DataRow label="Application catalog" value={castBoolToStr()(data.appCatalogEnabled)} />
          <DataRow
            label="Prometheus monitoring"
            value={castBoolToStr()(data.prometheusMonitoringEnabled)}
          />
          <DataRow
            label="Tags"
            value={<CodeBlock>{JSON.stringify(data.tags || [], null, 2)}</CodeBlock>}
          />
        </TableBody>
      </Table>
    </React.Fragment>
  )
}

export default AzureClusterReviewTable
