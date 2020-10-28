import React from 'react'
import { loadNodes } from 'k8s/components/infrastructure/nodes/actions'
import useDataLoader from 'core/hooks/useDataLoader'
import FormReviewTable from 'core/components/validatedForm/review-table'
import { NetworkBackendTypes } from '../form-components/network-backend'

const getFilteredNodesFormattedName = (nodes, filterList = []) =>
  nodes
    .filter((node) => filterList.includes(node.uuid))
    .map((node) => `${node.name} - ${node.primaryIp}`)

const calicoFields = ['calicoIpIpMode', 'calicoNatOutgoing', 'calicoV4BlockSize']
const BareOsClusterReviewTable = ({ wizardContext, columns }) => {
  const [nodes] = useDataLoader(loadNodes)
  let reviewTableColumns = columns
  const data = {
    ...wizardContext,
    masterNodes: getFilteredNodesFormattedName(nodes, wizardContext.masterNodes),
    workerNodes: getFilteredNodesFormattedName(nodes, wizardContext.workerNodes),
  }
  if (wizardContext.networkPlugin !== NetworkBackendTypes.Calico) {
    reviewTableColumns = columns.filter((column) => !calicoFields.includes(column.id))
  }

  return <FormReviewTable data={data} columns={reviewTableColumns} />
}

export default BareOsClusterReviewTable
