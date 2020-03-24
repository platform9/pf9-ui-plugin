import React from 'react'
import FormWrapper from 'core/components/FormWrapper'
import { volumeActions } from './actions'
import AddVolumeTypeForm from './AddVolumeTypeForm'
import useReactRouter from 'use-react-router'
import useDataUpdater from 'core/hooks/useDataUpdater'

const AddVolumeTypePage = () => {
  const { history } = useReactRouter()
  const [create, creating] = useDataUpdater(volumeActions.create, success => {
    if (success) {
      history.push('/ui/openstack/storage#volumeTypes')
    }
  })

  return (
    <FormWrapper loading={creating} title="Add Volume Type" backUrl="/ui/openstack/storage#volumeTypes">
      <AddVolumeTypeForm onComplete={create} />
    </FormWrapper>
  )
}

export default AddVolumeTypePage
