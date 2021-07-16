import React, { useCallback, useMemo } from 'react'
import useReactRouter from 'use-react-router'
import useDataLoader from 'core/hooks/useDataLoader'
import { propEq } from 'ramda'
import useDataUpdater from 'core/hooks/useDataUpdater'
import FormWrapper from 'core/components/FormWrapper'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { rbacProfileActions, rbacProfileBindingsActions } from './actions'
import SubmitButton from 'core/components/SubmitButton'
import useParams from 'core/hooks/useParams'
import DocumentMeta from 'core/components/DocumentMeta'
import { makeStyles } from '@material-ui/styles'
import { routes } from 'core/utils/routes'
import Text from 'core/elements/text'
import ListTableField from 'core/components/validatedForm/ListTableField'
import Theme from 'core/themes/model'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'

const useStyles = makeStyles((theme: Theme) => ({
  validatedFormContainer: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
}))

const ClusterField = ({ clusterId }) => {
  const [clusters] = useDataLoader(clusterActions.list)
  const clusterName = useMemo(() => {
    return clusters.find(propEq('uuid', clusterId))?.name || clusterId
  }, [clusters])
  return <span>{clusterName}</span>
}

const renderClusterField = (clusterId) => <ClusterField clusterId={clusterId} />

const renderProfileField = (profile) => {
  const profileName = profile.split('default/')[1]
  return <span>{profileName}</span>
}

const columns = [
  { id: 'spec.clusterRef', label: 'Cluster', render: renderClusterField },
  { id: 'spec.profileRef', label: 'Profile', render: renderProfileField },
]

const DeleteProfileBindingsPage = () => {
  const { match, history } = useReactRouter()
  const classes = useStyles()
  const profileName = match.params.name
  const [profiles, loadingProfiles] = useDataLoader(rbacProfileActions.list)
  const [handleRemove, deleting] = useDataUpdater(rbacProfileBindingsActions.delete)
  const [, , reloadBindings] = useDataLoader(rbacProfileBindingsActions.list)
  const onComplete = useCallback(
    (success) => success && history.push(routes.rbac.profiles.list.path()),
    [history],
  )
  const profile = useMemo(() => profiles.find(propEq('name', profileName)) || {}, [
    profiles,
    profileName,
  ])
  const { params, getParamsUpdater } = useParams({
    selectedProfileBindings: [],
  })

  const handleSubmit = useCallback(
    async (params) => {
      await Promise.all(params.selectedProfileBindings.map(handleRemove))
      // the dataUpdater for delete doesn't update the cache
      // This needs to be fixed so that the GET call doesn't
      // have to be called twice
      reloadBindings(true)
      onComplete(true)
    },
    [onComplete, handleRemove],
  )

  return (
    <>
      <DocumentMeta title="Manage Profile Bindings" bodyClasses={['form-view']} />
      <FormWrapper
        title={`Manage Profile Bindings`}
        loading={loadingProfiles || deleting}
        message={loadingProfiles ? 'Loading Profile Bindings...' : 'Deleting Profile Bindings...'}
        backUrl={routes.rbac.profiles.list.path()}
      >
        <ValidatedForm
          title="Delete Profile Bindings"
          classes={{ root: classes.validatedFormContainer }}
          formActions={<SubmitButton>Delete Profile Bindings</SubmitButton>}
          onSubmit={handleSubmit}
        >
          <Text variant="body2">
            Select profile bindings to delete below. A cluster's current RBAC configurations will
            not be affected by profile binding deletions.
          </Text>
          <ListTableField
            id="selectedProfileBindings"
            data={profile.bindings || []}
            loading={loadingProfiles}
            columns={columns}
            onChange={getParamsUpdater('selectedProfileBindings')}
            value={params.selectedProfileBindings}
            uniqueIdentifier="name"
            required
            multiSelection
          />
        </ValidatedForm>
      </FormWrapper>
    </>
  )
}

export default DeleteProfileBindingsPage
