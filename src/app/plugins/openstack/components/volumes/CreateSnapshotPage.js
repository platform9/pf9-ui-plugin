import React from 'react'
import useReactRouter from 'use-react-router'
import FormWrapper from 'core/components/FormWrapper'
import { volumeSnapshotActions } from './actions'
import CreateSnapshotForm from './CreateSnapshotForm'
import useDataUpdater from 'core/hooks/useDataUpdater'

const CreateSnapshotPage = () => {
  const { history, match } = useReactRouter()
  const { volumeId } = match.params
  const [create, creating] = useDataUpdater(volumeSnapshotActions.create, success => {
    if (success) {
      history.push('/ui/openstack/storage#volumeSnapshots')
    }
  })
  const handleAdd = snapshotData => {
    create({
      ...snapshotData,
      volumeId,
    })
  }

  return (
    <FormWrapper loading={creating} title="Create Snapshot" backUrl="/ui/openstack/storage#volumes">
      <CreateSnapshotForm onComplete={handleAdd} />
    </FormWrapper>
  )
}

export default CreateSnapshotPage
