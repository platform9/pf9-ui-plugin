import { makeStyles } from '@material-ui/styles'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import React, { useCallback, useEffect, useState } from 'react'
import { cloudProviderActions } from '../infrastructure/cloudProviders/actions'
import Theme from 'core/themes/model'
import Card from './card'
import useDataUpdater from 'core/hooks/useDataUpdater'
import AddCloudProviderCredentialStep from '../infrastructure/cloudProviders/AddCloudProviderCredentialStep'
import { formTitle } from '../infrastructure/cloudProviders/AddCloudProviderPage'
import { ErrorMessage } from 'core/components/validatedForm/ErrorMessage'

const useStyles = makeStyles<Theme>((theme) => ({
  cloudProviders: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
  form: {
    minHeight: '500px',
    justifyContent: 'flex-start',
  },
  errorMessage: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}))

const AddCloudProviderPage = ({
  cloudProviders,
  loadingCloudProviders,
  wizardContext,
  setWizardContext,
  onNext,
  handleNext,
  setSubmitting,
  clusterChoice,
}) => {
  const classes = useStyles()
  const [activeCloudProvider, setActiveCloudProvider] = useState(null)
  const [deleteCloudProvider] = useDataUpdater(cloudProviderActions.delete)
  const [showExistingCloudProviders, setShowExistingCloudProviders] = useState(false)
  const [creatingCluster, setCreatingCluster] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (loadingCloudProviders || creatingCluster) {
      return
    }
    if (cloudProviders.length === 0) {
      setShowExistingCloudProviders(false)
    } else if (cloudProviders.length > 0) {
      setShowExistingCloudProviders(true)
    }
  }, [cloudProviders, creatingCluster])

  const handleOnClick = (cloudProvider) => () => {
    setActiveCloudProvider(cloudProvider)
    setWizardContext({ cloudProviderId: cloudProvider.uuid, provider: cloudProvider.type })
  }

  const handleDelete = (cloudProvider) => async () => {
    setSubmitting(true)
    await deleteCloudProvider(cloudProvider)
    setSubmitting(false)
  }

  const toggleForms = () => {
    setCreatingCluster(true)
    setActiveCloudProvider({ cloudProviderId: null })
    setShowExistingCloudProviders(false)
  }

  const submitStep = useCallback(() => {
    if (!wizardContext.cloudProviderId) {
      setError('Must select an existing cloud provider or create a new one')
      return false
    }
    setError(null)
    return true
  }, [wizardContext])

  useEffect(() => {
    console.log('showExisting', showExistingCloudProviders)
    if (showExistingCloudProviders) {
      onNext(submitStep)
    }
  }, [submitStep, showExistingCloudProviders])

  return (
    <>
      {!showExistingCloudProviders && (
        <AddCloudProviderCredentialStep
          wizardContext={wizardContext}
          setWizardContext={setWizardContext}
          onNext={onNext}
          handleNext={handleNext}
          title={formTitle(wizardContext)}
          setSubmitting={setSubmitting}
          header={
            clusterChoice === 'import' ? 'Select the Cloud to Import Clusters From' : undefined
          }
        />
      )}
      {showExistingCloudProviders && (
        <>
          <FormFieldCard
            className={classes.form}
            title="Select an existing cloud provider or create a new one"
          >
            <div className={classes.cloudProviders}>
              {cloudProviders.map((cp) => (
                <Card
                  key={cp.name}
                  label={cp.name}
                  active={activeCloudProvider?.name === cp.name}
                  onClick={handleOnClick(cp)}
                  onDelete={handleDelete(cp)}
                />
              ))}
              <Card
                label="+ Add a new cloud provider"
                showTrashIcon={false}
                onClick={toggleForms}
              />
            </div>
          </FormFieldCard>
          {error && (
            <div className={classes.errorMessage}>
              <ErrorMessage>{error}</ErrorMessage>
            </div>
          )}
        </>
      )}
    </>
  )
}

export default AddCloudProviderPage
