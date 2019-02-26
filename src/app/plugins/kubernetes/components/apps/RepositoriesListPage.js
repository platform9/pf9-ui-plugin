import createCRUDComponents from 'core/helpers/createCRUDComponents'
import React from 'react'
import { loadRepositories, deleteRepository } from 'k8s/components/apps/actions'
import { loadInfrastructure } from 'k8s/components/infrastructure/actions'
import { withAppContext } from 'core/AppContext'
import Loader from 'core/components/Loader'
import { compose } from 'ramda'
import requiresAuthentication from 'openstack/util/requiresAuthentication'
import { withDataLoader } from 'core/DataLoader'

const ListPage = ({ ListContainer }) => {
  class ListPage extends React.Component {
    async componentDidMount () {
      const { context, setContext } = this.props

      await loadRepositories({
        context,
        setContext,
      })
    }

    render () {
      const { repositories } = this.props.context
      if (!repositories) { return <Loader /> }
      return (
        <ListContainer data={repositories} />
      )
    }
  }

  return withAppContext(ListPage)
}

export const options = {
  columns: [
    { id: 'attributes.name', label: 'Name' },
    { id: 'attributes.URL', label: 'URL' },
    { id: 'attributes.source', label: 'Source' },
    { id: 'clusters', label: 'Clusters' },
  ],
  dataKey: 'repositories',
  editUrl: '/ui/kubernetes/infrastructure/repositories/edit',
  deleteFn: deleteRepository,
  name: 'Repositories',
  title: 'Repositories',
  uniqueIdentifier: 'id',
  ListPage,
}

const { ListPage: RepositoriesListPage } = createCRUDComponents(options)

export default compose(
  requiresAuthentication,
  withDataLoader({ dataKey: 'clusters', loaderFn: loadInfrastructure }),
)(RepositoriesListPage)
