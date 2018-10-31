import React from 'react'
import Picklist from 'core/common/Picklist'
import createCRUDComponents from 'core/createCRUDComponents'
import { withAppContext } from 'core/AppContext'
import { loadInfrastructure } from '../infrastructure/actions'

let ListContainer = null

class ListPage extends React.Component {
  state = {
    activeCluster: null,
    namespaces: null,
    clusterOptions: [],
  }

  async componentDidMount () {
    const { context, setContext } = this.props
    const infrastructure = await loadInfrastructure({ context, setContext })
    console.log(infrastructure)
  }

  handleChangeCluster = clusterId => {
    this.setState({ activeCluster: clusterId })
  }

  render () {
    const { namespaces, activeCluster, clusterOptions } = this.state
    if (!activeCluster) { return null }
    return (
      <div>
        <Picklist
          name="currentCluster"
          label="Current Cluster"
          options={clusterOptions}
          value={activeCluster}
          onChange={this.handleChangeCluster}
        />

        <ListContainer data={namespaces} />
        <pre>{JSON.stringify(namespaces, null, 4)}</pre>
      </div>
    )
  }
}
const NamespacesListPage = withAppContext(ListPage)

export const options = {
  baseUrl: '/ui/kubernetes/namespaces',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'created', label: 'Created' },
  ],
  dataKey: 'namespaces',
  actions: { service: 'qbert', entity: 'namespaces' },
  name: 'Namespaces',
  title: 'Namespaces',
  ListPage: NamespacesListPage,
}

const components = createCRUDComponents(options)
ListContainer = components.ListContainer
export const NodesList = components.List

export default components.ListPage
