import React from 'react'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import PicklistField from 'core/components/validatedForm/PicklistField'
import SubmitButton from 'core/components/SubmitButton'
import createAddComponents from 'core/helpers/createAddComponents'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import TextField from 'core/components/validatedForm/TextField'
import { namespacesCacheKey } from './actions'
import useParams from 'core/hooks/useParams'
import { namespaceValidator } from 'core/utils/fieldValidators'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { makeStyles } from '@material-ui/styles'

const defaultParams = {
  masterNodeClusters: true,
  clusterId: null,
}

const useStyles = makeStyles((theme) => ({
  formWidth: {
    width: 715,
  },
  inputWidth: {
    maxWidth: 350,
  },
  submit: {
    display: 'flex',
    marginLeft: theme.spacing(2),
  },
}))

export const AddNamespaceForm = ({ onComplete }) => {
  const classes = useStyles()
  const { params, getParamsUpdater } = useParams(defaultParams)
  return (
    <ValidatedForm onSubmit={onComplete}>
      <div className={classes.formWidth}>
        <FormFieldCard title="Name Your Namespace">
          <div className={classes.inputWidth}>
            <TextField id="name" label="Name" required validations={[namespaceValidator]} />
            <PicklistField
              DropdownComponent={ClusterPicklist}
              id="clusterId"
              label="Cluster"
              onChange={getParamsUpdater('clusterId')}
              value={params.clusterId}
              required
            />
          </div>
        </FormFieldCard>
      </div>
      <div className={classes.submit}>
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
