import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getDriftAnalysis, rbacProfileActions } from '../actions'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import Text from 'core/elements/text'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import ListTableField from 'core/components/validatedForm/ListTableField'
import { cloudProviderTypes } from 'k8s/components/infrastructure/cloudProviders/selectors'
import { capitalizeString } from 'utils/misc'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import useDataLoader from 'core/hooks/useDataLoader'
import DryRunDialog from '../deploy/dry-run-dialog'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { TypesTableCell } from '../rbac-profiles-list-page'

const useStyles = makeStyles((theme: Theme) => ({
  validatedFormContainer: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
  largeTopMargin: {
    marginTop: theme.spacing(2),
  },
}))

interface Props {
  wizardContext: any
  setWizardContext: any
  onNext: any
  handleNext: any
  setSubmitting: any
}

const renderTypes = (_, profile) => <TypesTableCell profile={profile} />

const profileColumns = [
  { id: 'name', label: 'Name' },
  { id: 'roles', label: 'Types', render: renderTypes },
]

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'kubeRoleVersion', label: 'Version' },
  {
    id: 'cloudProviderType',
    label: 'Cloud Provider',
    render: (type) => cloudProviderTypes[type] || capitalizeString(type),
  },
  {
    id: 'enableProfileAgent',
    label: 'Profile Agent',
    render: (enabled) => (enabled ? 'Yes' : 'No'),
  },
]

const profileAgentInstalled = (cluster) => !!cluster.enableProfileAgent

const ClusterProfileSelection = ({
  wizardContext,
  setWizardContext,
  onNext,
  handleNext,
  setSubmitting,
}: Props) => {
  const classes = useStyles({})
  const [showDialog, setShowDialog] = useState(true)
  const [bindingName, setBindingName] = useState('')
  const validatorRef = useRef(null)
  const [profiles, profilesLoading] = useDataLoader(rbacProfileActions.list)
  const [clusters, clustersLoading] = useDataLoader(clusterActions.list)
  const publishedProfiles = useMemo(
    () => profiles.filter((profile) => profile.status.phase === 'published'),
    [profiles],
  )
  const setupValidator = (validate) => {
    validatorRef.current = { validate }
  }

  const submitStep = useCallback(async () => {
    const isValid = validatorRef.current.validate()
    if (!isValid) {
      return false
    }
    setSubmitting(true)
    try {
      const response: any = await getDriftAnalysis({
        cluster: wizardContext.cluster,
        profileName: wizardContext.profile[0].name,
      })
      setBindingName(response.metadata?.name)
      // I need to put an interval here to get the profile binding details
      setSubmitting(false)
      setShowDialog(true)
    } catch (err) {
      setSubmitting(false)
      return false
    }
    return false
  }, [wizardContext])

  useEffect(() => {
    // submitStep will always return false and prevent the user from
    // proceeding to the next step because we only want to move on to
    // the next step when the user closes the TestsDialog box
    onNext(submitStep)
  }, [submitStep])

  const proceed = () => {
    // Move on to the next step
    setShowDialog(false)
    onNext()
    handleNext()
  }

  return (
    <>
      <ValidatedForm
        classes={{ root: classes.validatedFormContainer }}
        initialValues={wizardContext}
        onSubmit={setWizardContext}
        triggerSubmit={setupValidator}
        elevated={false}
      >
        <FormFieldCard title="Select Profile">
          <Text variant="body2">
            Select a profile to analyze the drift if it is applied to a selected cluster. Only
            available profiles that are <b>active and published</b> are shown below.
          </Text>
          <ListTableField
            id="profile"
            data={publishedProfiles}
            loading={profilesLoading}
            columns={profileColumns}
            onChange={(value) => setWizardContext({ profile: value })}
            value={wizardContext.profile}
            uniqueIdentifier="id"
            required
          />
        </FormFieldCard>
        <FormFieldCard title="Select Cluster">
          <Text variant="body2">
            Select a cluster to analyze the drift if the profile selected above is applied to it. A
            profile agent will need to be deployed to analyze the drift.
          </Text>
          <ListTableField
            id="cluster"
            data={clusters}
            loading={clustersLoading}
            columns={columns}
            onChange={(value) => setWizardContext({ cluster: value })}
            value={wizardContext.cluster}
            checkboxCond={profileAgentInstalled}
            uniqueIdentifier="uuid"
            required
          />
        </FormFieldCard>
        {showDialog && bindingName && (
          <DryRunDialog
            handleClose={() => setShowDialog(false)}
            onFinish={proceed}
            bindingName={bindingName}
            setWizardContext={setWizardContext}
          />
        )}
      </ValidatedForm>
    </>
  )
}

export default ClusterProfileSelection
