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
import DryRunDialog from './dry-run-dialog'
import { customValidator, requiredValidator } from 'core/utils/fieldValidators'

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

const renderActiveProfile = (hasBinding) => <span>{hasBinding ? 'Yes' : 'No'}</span>

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'kubeRoleVersion', label: 'Version' },
  {
    id: 'cloudProviderType',
    label: 'Cloud Provider',
    render: (type) => cloudProviderTypes[type] || capitalizeString(type),
  },
  {
    id: 'hasBinding',
    label: 'Active Profile',
    render: renderActiveProfile,
  },
  {
    id: 'enableProfileAgent',
    label: 'Profile Agent',
    render: (enabled) => (enabled ? 'Yes' : 'No'),
  },
]

const profileAgentInstalled = (cluster) => !!cluster.enableProfileAgent

const clusterValidations = [
  requiredValidator,
  customValidator((clusters) => {
    if (!clusters.length) {
      return false
    }
    const cluster = clusters[0]
    return !cluster.hasBinding
  }, 'Selected cluster may not have an active profile binding. You can delete the profile binding by managing bindings on the RBAC profiles view.'),
]

const SelectClusterStep = ({
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
  const mappedClusters = useMemo(() => {
    if (clusters.length && profiles.length) {
      const allBindings = profiles
        .map((profile) => {
          return profile.bindings
        })
        .flat()
      // @ts-ignore path complaining about typing, remove ignore after models attached
      const bindingsByClusterId = indexBy(path(['spec', 'clusterRef']), allBindings)
      return clusters.map((cluster) => {
        return {
          ...cluster,
          hasBinding: !!bindingsByClusterId[cluster.uuid],
        }
      })
    }
    return clusters
  }, [clusters, profiles])

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
      const response: any = await getDriftAnalysis(wizardContext)
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
        title="Select a Cluster to Deploy to"
      >
        <Text variant="body2">
          Choose a cluster to deploy this RBAC profile to. The cluster will use the RBAC permissions
          that currently belong to the RBAC profile. If you make changes to a profile, you will need
          to redeploy the profile to any clusters you wish to use the updated permissions.
        </Text>
        <Text variant="body2" className={classes.largeTopMargin}>
          RBAC profiles may only be deployed onto clusters with Kubernetes version 1.2+ that have
          Profile Agent installed.
        </Text>
        <ListTableField
          id="cluster"
          data={mappedClusters}
          loading={clustersLoading || profilesLoading}
          columns={columns}
          onChange={(value) => setWizardContext({ cluster: value })}
          value={wizardContext.cluster}
          checkboxCond={profileAgentInstalled}
          uniqueIdentifier="uuid"
          validations={clusterValidations}
        />
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

export default SelectClusterStep
