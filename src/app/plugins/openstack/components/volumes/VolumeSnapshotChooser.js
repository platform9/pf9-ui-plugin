import React from 'react'
import PropTypes from 'prop-types'

const VolumeSnapshotChooser = ({ snapshots, onChange }) => {
  if (!snapshots) { return null }
  // TODO: still implementing
  return (
    <div>
      <h1>Volume Snapshot Chooser</h1>
      <pre>{JSON.stringify(snapshots, null, 4)}</pre>
    </div>
  )
}

VolumeSnapshotChooser.propTypes = {
  snapshots: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func,
}

export default VolumeSnapshotChooser
