import React from 'react'
import TextField from 'core/components/validatedForm/TextField'
import CheckboxField from 'core/components/validatedForm/CheckboxField'

const EtcdBackupFields = ({ wizardContext, setWizardContext }) => {
  return (
    <>
      <CheckboxField
        id="etcdBackup"
        label="Enable etcd Backup"
        info="Enable automated etcd backups on this cluster"
        onChange={(value) => setWizardContext({ etcdBackup: value })}
      />

      {wizardContext.etcdBackup && (
        <>
          <TextField
            id="etcdStoragePath"
            label="Storage Path"
            info="This is the disk path where the etcd backup data will be stored on each master node of this cluster"
            required
          />

          {/* https://stackoverflow.com/questions/47798104/set-min-max-on-textfield-type-number */}
          <TextField
            id="etcdBackupInterval"
            label="Backup Interval (minutes)"
            type="number"
            step="1"
            InputProps={{ inputProps: { min: 30 } }}
            info="Specify how often the backup should be taken."
            required
          />
        </>
      )}
    </>
  )
}

export default EtcdBackupFields
