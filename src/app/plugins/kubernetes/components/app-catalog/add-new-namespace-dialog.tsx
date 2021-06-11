import { Dialog, DialogActions } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { useAppSelector } from 'app/store'
import SubmitButton from 'core/components/buttons/SubmitButton'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import Progress from 'core/components/progress/Progress'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import Button from 'core/elements/button'
import Text from 'core/elements/text'
import useDataUpdater from 'core/hooks/useDataUpdater'
import useListAction from 'core/hooks/useListAction'
import Theme from 'core/themes/model'
import { namespaceValidator } from 'core/utils/fieldValidators'
import React, { useMemo, useState } from 'react'
import { emptyObj } from 'utils/fp'
import { listClusters } from '../infrastructure/clusters/actions'
import { makeParamsClustersSelector } from '../infrastructure/clusters/selectors'
import namespaceActions from '../namespaces/actions'

const useStyles = makeStyles((theme: Theme) => ({
  dialogButtons: {
    justifyContent: 'flex-start',
    padding: theme.spacing(0),
    marginTop: theme.spacing(3),
  },
  success: {
    color: theme.palette.green.main,
    marginRight: theme.spacing(1),
  },
  fail: {
    color: theme.palette.red.main,
    marginRight: theme.spacing(1),
  },
  cancelButton: {
    background: theme.palette.grey['000'],
    border: `1px solid ${theme.palette.blue[500]}`,
    color: theme.palette.blue[500],
  },
}))

const result = {
  success: {
    icon: 'check',
    title: 'Success',
    getText: (
      name,
    ) => `The namespace ${name} was successfuly created. It can now be utilized for your app
    deployment.`,
    buttonLabel: 'Continue',
  },
  fail: {
    icon: 'exclamation-circle',
    title: 'Namespace creation failed',
    getText: () => 'The creation of the namespace you specified was unsuccessful.',
    buttonLabel: 'Ok',
  },
}

enum Status {
  Success = 'success',
  Fail = 'fail',
}

const selector = makeParamsClustersSelector()

const AddNewNamespaceDialog = ({ clusterId, onClose }) => {
  const classes = useStyles()
  const [loadingClusters] = useListAction(listClusters)
  const clusters = useAppSelector((state) => selector(state, emptyObj))
  const cluster = useMemo(() => clusters.find((cluster) => cluster.uuid === clusterId), [
    clusters,
    clusterId,
  ])
  const [createNamespace, creatingNamespace] = useDataUpdater(namespaceActions.create)
  const [showResult, setShowResult] = useState(false)
  const [status, setStatus] = useState<Status>(Status.Fail)
  const [namespaceName, setNamespaceName] = useState('')

  const handleSubmit = async ({ name }) => {
    const [success] = await createNamespace({ clusterId, name })
    setStatus(success ? Status.Success : Status.Fail)
    setShowResult(true)
    setNamespaceName(name)
  }

  return (
    <Dialog open fullWidth maxWidth="sm">
      {!showResult && (
        <FormFieldCard title="Create New Namespace">
          <Progress loading={loadingClusters || creatingNamespace} minHeight={100} maxHeight={100}>
            <ValidatedForm onSubmit={handleSubmit}>
              <Text variant="body2">Create a new namespace for cluster {cluster.name}.</Text>
              <TextField id="name" label="Namespace" required validations={[namespaceValidator]} />
              <DialogActions className={classes.dialogButtons}>
                <Button className={classes.cancelButton} onClick={onClose}>
                  Cancel
                </Button>
                <SubmitButton />
              </DialogActions>
            </ValidatedForm>
          </Progress>
        </FormFieldCard>
      )}
      {showResult && (
        <FormFieldCard
          title={
            <Text variant="body1" component="span">
              <FontAwesomeIcon className={classes[status]}>{result[status].icon}</FontAwesomeIcon>
              {result[status].title}
            </Text>
          }
        >
          <Text variant="body2">{result[status].getText(namespaceName)}</Text>
          <DialogActions className={classes.dialogButtons}>
            <SubmitButton onClick={onClose}>{result[status].buttonLabel}</SubmitButton>
          </DialogActions>
        </FormFieldCard>
      )}
    </Dialog>
  )
}

export default AddNewNamespaceDialog
