import React, { useCallback, useMemo, useEffect } from 'react'
import useReactRouter from 'use-react-router'
import useDataLoader from 'core/hooks/useDataLoader'
import { find, propEq, pipe, when, always, isNil, path } from 'ramda'
import { emptyObj, objToKeyValueArr, keyValueArrToObj } from 'utils/fp'
import useDataUpdater from 'core/hooks/useDataUpdater'
import FormWrapper from 'core/components/FormWrapper'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { pathJoin } from 'utils/misc'
import { k8sPrefix, defaultEtcBackupPath } from 'app/constants'
import { clusterActions } from './actions'
import SubmitButton from 'core/components/SubmitButton'
import useParams from 'core/hooks/useParams'
import EtcdBackupFields from './form-components/etcd-backup'
import Name from './form-components/name'
import TagsField from './form-components/tags'
import DocumentMeta from 'core/components/DocumentMeta'

const listUrl = pathJoin(k8sPrefix, 'infrastructure')

// Hide pf9-system:monitoring tag from the display
// bc that tag should be handled completely by appbert.
// If the tag exists, we do not want to remove it
// so just hide it from view.
const tagsToOmit = ['pf9-system:monitoring']

const EditClusterPage = () => {
  const { match, history } = useReactRouter()
  const clusterId = match.params.id
  const onComplete = useCallback((success) => success && history.push(listUrl), [history])
  const [clusters, loadingClusters] = useDataLoader(clusterActions.list)
  const { params, updateParams, getParamsUpdater } = useParams({})

  const initialValues = useMemo(
    () =>
      pipe(
        find(propEq('uuid', clusterId)),
        when(isNil, always(emptyObj)),
        ({ tags = {}, etcdBackup = {}, ...cluster }) => ({
          ...cluster,
          tags: objToKeyValueArr(tags),
          etcdBackup: !!etcdBackup.isEtcdBackupEnabled,
          etcdStoragePath:
            path(['storageProperties, localStorage'], etcdBackup) || defaultEtcBackupPath,
          etcdBackupInterval: etcdBackup.intervalInMins || 60 * 24,
        }),
      )(clusters),
    [clusters, clusterId],
  )

  useEffect(() => {
    const { etcdBackup } = find(propEq('uuid', clusterId))(clusters) || {}
    if (!etcdBackup) {
      return
    }
    updateParams({ etcdBackup: !!etcdBackup.isEtcdBackupEnabled })
  }, [clusters, clusterId])

  // Need to add etcdBackup stuff to here
  const [update, updating] = useDataUpdater(clusterActions.update, onComplete)
  const handleSubmit = useCallback(
    ({ tags, ...cluster }) =>
      update({
        ...cluster,
        // The cluster ID is not present in the form as a field so it won't be passed as a value to the submit function
        uuid: initialValues.uuid,
        tags: keyValueArrToObj(tags),
      }),
    [update, initialValues],
  )

  return (
    <>
      <DocumentMeta title="Edit Cluster" bodyClasses={['form-view']} />
      <FormWrapper
        title={`Edit Cluster ${initialValues.name || ''}`}
        loading={loadingClusters || updating}
        message={updating ? 'Submitting form...' : 'Loading Cluster...'}
        backUrl={listUrl}
      >
        <ValidatedForm
          title="Basic Details"
          formActions={<SubmitButton>Update Cluster</SubmitButton>}
          initialValues={initialValues}
          onSubmit={handleSubmit}
        >
          {/* Cluster Name */}
           <Name setWizardContext={getParamsUpdater} />

          {/* Etcd Backup */}
           <EtcdBackupFields wizardContext={params} setWizardContext={getParamsUpdater} />

          {/* Tags */}
           <Tags info="Edit tag metadata on this cluster" blacklistedTags={tagsToOmit} />

        </ValidatedForm>
      </FormWrapper>
    </>
  )
}

export default EditClusterPage
