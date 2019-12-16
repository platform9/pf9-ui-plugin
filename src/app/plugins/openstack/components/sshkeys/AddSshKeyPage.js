import React from 'react'
import FormWrapper from 'core/components/FormWrapper'
import sshKeyActions from './actions'
import AddSshKeyForm from './AddSshKeyForm'
import useDataUpdater from 'core/hooks/useDataUpdater'
import useReactRouter from 'use-react-router'

const AddSshKeyPage = () => {
  const { history } = useReactRouter()
  const [create, creating] = useDataUpdater(sshKeyActions.create, success => {
    if (success) {
      history.push('/ui/openstack/sshkeys')
    }
  })
  return (
    <FormWrapper loading={creating} title="Add SSH Key" backUrl="/ui/openstack/sshkeys">
      <AddSshKeyForm onComplete={create} />
    </FormWrapper>
  )
}

export default AddSshKeyPage
