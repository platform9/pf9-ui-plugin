import React from 'react'
import PropTypes from 'prop-types'

import ListTable from 'core/common/ListTable'

const columns = [
  { id: 'name', label: 'Name' },
]

class NetworksList extends React.Component {
  render () {
    const { onAdd, onDelete, networks } = this.props

    if (!networks || networks.length === 0) {
      return (<h1>No networks found</h1>)
    }

    return (
      <ListTable
        title="Networks"
        columns={columns}
        data={networks}
        onAdd={onAdd}
        onDelete={onDelete}
        actions={['delete']}
      />
    )
  }
}

NetworksList.propTypes = {
  /** List of networks [{ name, cidr, tenant, ... }] */
  networks: PropTypes.array.isRequired,

  /** What to do when the add button is clicked */
  onAdd: PropTypes.func.isRequired,

  /** Called onClick of delete icon for a network row */
  onDelete: PropTypes.func.isRequired,
}

NetworksList.defaultProps = {
  networks: [],
}

export default NetworksList
