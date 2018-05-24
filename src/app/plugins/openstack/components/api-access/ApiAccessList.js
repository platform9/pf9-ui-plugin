import React from 'react'
import PropTypes from 'prop-types'

import ListTable from 'core/common/ListTable'

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'type', label: 'Type' },
  { id: 'url', label: 'URL' },
]

class ApiAccessList extends React.Component {
  render () {
    const { catalog } = this.props
    const _catalog = catalog.map((service) => {
      return {
        id: service.id,
        name: service.name,
        type: service.type,
        url: service.endpoints.find((endpoint) => {
          return endpoint.interface === 'internal'
        }).url
      }
    })

    if (!catalog || catalog.length === 0) {
      return (<h1>No endpoints found</h1>)
    }

    return (
      <ListTable
        title="API Endpoints"
        columns={columns}
        data={_catalog}
        paginate={false}
        showCheckboxes={false}
      />
    )
  }
}

ApiAccessList.propTypes = {
  /** List of services [{ name, type, endpoints, ... }] */
  catalog: PropTypes.array.isRequired,
}

ApiAccessList.defaultProps = {
  catalog: [],
}

export default ApiAccessList
