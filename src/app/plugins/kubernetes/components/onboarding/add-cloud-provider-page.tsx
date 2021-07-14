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
import PrevButton from 'core/components/buttons/PrevButton'
import SubmitButton from 'core/components/buttons/SubmitButton'
import { onboardClusterTracking } from './tracking'
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
  header: {
    marginTop: '0px',
  },
}))

const AddCloudProviderPage = ({
  cloudProviders,
  wizardContext,
  setWizardContext,
  onNext,
  handleNext,
  setSubmitting,
  clusterChoice,
  handleBack,
}) => {
  const classes = useStyles()
  const [activeCloudProvider, setActiveCloudProvider] = useState(null)
  const [deleteCloudProvider] = useDataUpdater(cloudProviderActions.delete)
  const [showExistingCloudProviders, setShowExistingCloudProviders] = useState(
    cloudProviders.length !== 0,
  )
  const [error, setError] = useState(null)

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
    setActiveCloudProvider({ cloudProviderId: null })
    setShowExistingCloudProviders(false)
  }

  const submitStep = useCallback(() => {
    onboardClusterTracking.wZSelectedCloudProvider(
      activeCloudProvider.name,
      activeCloudProvider.type,
    )
    if (!wizardContext.cloudProviderId) {
      setError('Must select an existing cloud provider or create a new one')
      return false
    }
    setError(null)
    return true
  }, [wizardContext])

  useEffect(() => {
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
          headerClass={classes.header}
        />
      )}
      {showExistingCloudProviders && (
        <>
          <FormFieldCard
            className={classes.form}
            title="Select an existing cloud provider or create a new one"
          >
            <div className={classes.cloudProviders}>
              {cloudProviders?.map((cp) => (
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
      <PrevButton onClick={handleBack} />
      <SubmitButton onClick={handleNext}>
        {showExistingCloudProviders ? '+ Select Cloud Provider' : `+ Save Cloud Provider`}
      </SubmitButton>
    </>
  )
}

export default AddCloudProviderPage
