import React from 'react'
import PropTypes from 'prop-types'

import ListTable from 'core/common/ListTable'

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'vcpus', label: 'VCPUs' },
  { id: 'ram', label: 'RAM' },
  { id: 'disk', label: 'Disk' },
]

class FlavorsList extends React.Component {
  render () {
    const { onAdd, onDelete, flavors } = this.props

    if (!flavors || flavors.length === 0) {
      return (<h1>No flavors found</h1>)
    }

    return (
      <ListTable
        title="Flavors"
        columns={columns}
        data={flavors}
        onAdd={onAdd}
        onDelete={onDelete}
        actions={['delete']}
      />
    )
  }
}

FlavorsList.propTypes = {
  /** List of flavors [{ name, displayname, tenants, ... }] */
  flavors: PropTypes.array.isRequired,

  /** What to do when the add button is clicked */
  onAdd: PropTypes.func.isRequired,

  /** Called onClick of delete icon for a flavor row */
  onDelete: PropTypes.func.isRequired,
}

FlavorsList.defaultProps = {
  flavors: [],
}

export default FlavorsList
