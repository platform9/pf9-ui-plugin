import React from 'react'
import { makeStyles } from '@material-ui/styles'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import PicklistField from 'core/components/validatedForm/PicklistField'
import SubmitButton from 'core/components/SubmitButton'
import createAddComponents from 'core/helpers/createAddComponents'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import TextField from 'core/components/validatedForm/TextField'
import { namespacesCacheKey } from './actions'
import useParams from 'core/hooks/useParams'
import { namespaceValidator } from 'core/utils/fieldValidators'

const defaultParams = {
  masterNodeClusters: true,
}
const useStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(9),
  },
}))

export const AddNamespaceForm = ({ onComplete }) => {
  const { params, getParamsUpdater } = useParams(defaultParams)
  const classes = useStyles()
  return (
    <ValidatedForm onSubmit={onComplete}>
      <div className={classes.root}>
        <TextField id="name" label="Name" required validations={[namespaceValidator]} />
        <PicklistField
          DropdownComponent={ClusterPicklist}
          id="clusterId"
          label="Cluster"
          onChange={getParamsUpdater('clusterId')}
          value={params.clusterId}
          required
        />
        <SubmitButton>Add Namespace</SubmitButton>
      </div>
    </ValidatedForm>
  )
}

export const options = {
  cacheKey: namespacesCacheKey,
  FormComponent: AddNamespaceForm,
  listUrl: '/ui/kubernetes/namespaces',
  name: 'AddNamespace',
  title: 'Add Namespace',
}

const { AddPage } = createAddComponents(options)

export default AddPage
