import React, { useCallback, useMemo } from 'react'
import useReactRouter from 'use-react-router'
import useDataLoader from 'core/hooks/useDataLoader'
import { find, propEq, pipe, when, always, isNil } from 'ramda'
import { emptyObj } from 'utils/fp'
import useDataUpdater from 'core/hooks/useDataUpdater'
import FormWrapper from 'core/components/FormWrapper'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import { pathJoin } from 'utils/misc'
import { k8sPrefix } from 'app/constants'
import { clusterActions } from './actions'
import KeyValuesField from 'core/components/validatedForm/KeyValuesField'
import SubmitButton from 'core/components/SubmitButton'

const listUrl = pathJoin(k8sPrefix, 'infrastructure')

const tagsObjToArr = tags => Object.entries(tags).map(([key, value]) => ({ key, value }))
const tagsArrToObj = tags => tags.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})

const EditClusterPage = () => {
  const { match, history } = useReactRouter()
  const clusterId = match.params.id
  const onComplete = useCallback(
    success => success && history.push(listUrl),
    [history])
  const [clusters, loadingClusters] = useDataLoader(clusterActions.list)
  const initialValues = useMemo(
    () => pipe(
      find(propEq('uuid', clusterId)),
      when(isNil, always(emptyObj)),
      ({ tags = {}, ...cluster }) => ({
        ...cluster,
        tags: tagsObjToArr(tags),
      }),
    )(clusters),
    [clusters, clusterId])
  const [update, updating] = useDataUpdater(clusterActions.update, onComplete)
  const handleSubmit = useCallback(({ tags, ...cluster }) => update({
    ...cluster,
    tags: tagsArrToObj(tags),
  }), [update])

  return <FormWrapper
    title={`Edit Cluster ${initialValues.name || ''}`}
    loading={loadingClusters || updating}
    renderContentOnMount={false}
    message={updating ? 'Submitting form...' : 'Loading Cluster...'}
    backUrl={listUrl}>
    <ValidatedForm initialValues={initialValues} onSubmit={handleSubmit}>
      {/* Cluster Name */}
      <TextField
        id="name"
        label="Name"
        info="Name of the cluster"
        required
      />
      {/* Tags */}
      <KeyValuesField
        id="tags"
        label="Tags"
        info="Edit tag metadata on this cluster"
      />
      <SubmitButton>Update Cluster</SubmitButton>
    </ValidatedForm>
  </FormWrapper>
}

export default EditClusterPage
