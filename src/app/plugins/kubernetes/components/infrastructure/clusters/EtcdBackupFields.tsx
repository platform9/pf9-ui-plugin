import React from 'react'
import TextField from 'core/components/validatedForm/TextField'

const EtcdBackupFields = () => {
  return (
    <React.Fragment>
      {/* Etcd Storage Path */}
      <TextField
        id="etcdStoragePath"
        label="Storage Path"
        info="This is the disk path where the etcd backup data will be stored on each master node of this cluster"
        required
      />

      {/* Etcd Backup Interval */}
      {/* https://stackoverflow.com/questions/47798104/set-min-max-on-textfield-type-number */}
      <TextField
        id="etcdBackupInterval"
        label="Backup Interval (minutes)"
        type="number"
        step="1"
        InputProps={{ inputProps: { min: 1 } }}
        info="Specify how often the backup should be taken."
        required
      />
    </React.Fragment>
  )
}

export default EtcdBackupFields
