import React from 'react'
import { loadNodes } from 'k8s/components/infrastructure/nodes/actions'
import useDataLoader from 'core/hooks/useDataLoader'
import FormReviewTable from 'core/components/validatedForm/review-table'

const getFilteredNodesFormattedName = (nodes, filterList = []) =>
  nodes
    .filter((node) => filterList.includes(node.uuid))
    .map((node) => `${node.name} - ${node.primaryIp}`)

// TODO: azs, networking info, services/api FQDN auto-generate, MTU size
const BareOsClusterReviewTable = ({ wizardContext, columns }) => {
  const [nodes] = useDataLoader(loadNodes)

  const data = {
    ...wizardContext,
    masterNodes: getFilteredNodesFormattedName(nodes, wizardContext.masterNodes),
    workerNodes: getFilteredNodesFormattedName(nodes, wizardContext.workerNodes),
  }

  return <FormReviewTable data={data} columns={columns} />
}

export default BareOsClusterReviewTable
