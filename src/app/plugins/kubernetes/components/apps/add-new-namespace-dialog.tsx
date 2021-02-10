import React, { useState } from 'react'
import { Dialog, DialogActions } from '@material-ui/core'
import Text from 'core/elements/text'
import SubmitButton from 'core/components/buttons/SubmitButton'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import Progress from 'core/components/progress/Progress'
import TextField from 'core/components/validatedForm/TextField'
import Button from 'core/elements/button'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import namespaceActions from '../namespaces/actions'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { namespaceValidator } from 'core/utils/fieldValidators'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import useDataLoader from 'core/hooks/useDataLoader'
import { clusterActions } from '../infrastructure/clusters/actions'

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

const AddNewNamespaceDialog = ({ clusterId, onClose }) => {
  const classes = useStyles()
  const [clusters, loadingClusters] = useDataLoader(clusterActions.list)
  const cluster = clusters.find((cluster) => cluster.uuid === clusterId)
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
                <Button variant="light" color="secondary" onClick={onClose}>
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
