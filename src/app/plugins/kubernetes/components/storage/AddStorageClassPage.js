import React, { useEffect } from 'react'
import yaml from 'js-yaml'
import createAddComponents from 'core/helpers/createAddComponents'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import PicklistField from 'core/components/validatedForm/PicklistField'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import CodeMirror from 'core/components/validatedForm/CodeMirror'
import { allKey, codeMirrorOptions } from 'app/constants'
import { persistVolumesStorageClassesLink } from 'k8s/links'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import StorageTypePicklist from './StorageTypePicklist'
import storageClassesActions, { storageClassesCacheKey } from './actions'
import useParams from 'core/hooks/useParams'
import useDataLoader from 'core/hooks/useDataLoader'
import { makeStyles } from '@material-ui/styles'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import ExternalLink from 'core/components/ExternalLink'
import { clusterActions } from '../infrastructure/clusters/actions'
import { propEq } from 'ramda'
import { CloudProvidersFriendlyName } from '../infrastructure/cloudProviders/model'

const initialContext = {
  isDefault: false,
}

const useStyles = makeStyles((theme) => ({
  blueIcon: {
    color: theme.palette.primary.main,
  },
}))

export const AddStorageClassForm = ({ onComplete }) => (
  <Wizard onComplete={onComplete} context={initialContext}>
    {({ wizardContext, setWizardContext, onNext }) => (
      <>
        <BasicStep
          onSubmit={setWizardContext}
          triggerSubmit={onNext}
          wizardContext={wizardContext}
        />
        <CustomizeStep
          wizardContext={wizardContext}
          onSubmit={setWizardContext}
          triggerSubmit={onNext}
        />
      </>
    )}
  </Wizard>
)

const BasicStep = ({ onSubmit, triggerSubmit, wizardContext }) => {
  const listStorageClassesParams = {
    clusterId: allKey,
    healthyClusters: true,
  }
  const [clusters] = useDataLoader(clusterActions.list, [])
  const [storageClasses] = useDataLoader(storageClassesActions.list, listStorageClassesParams)
  const { params, getParamsUpdater } = useParams()
  const defaultStorageClassForCurrentCluster = (storageClass) =>
    storageClass.clusterId === params.clusterId &&
    storageClass.metadata.annotations['storageclass.kubernetes.io/is-default-class'] === 'true'
  const defaultExists = !!storageClasses.find(defaultStorageClassForCurrentCluster)

  // We need to know the cloud provider type for the selected cluster because we will conditionally
  // render different fields in the UI depending on  this.
  // Also, we need this information in later stages when we construct the YAML so we will store
  // it in the 'wizardContext'
  useEffect(() => {
    const selectedCluster = clusters.find(propEq('uuid', params.clusterId))
    if (!selectedCluster) {
      return
    }
    const clusterType = (selectedCluster && selectedCluster.cloudProviderType) || ''
    onSubmit({ clusterType })
  }, [params.clusterId])

  const cloudProviderName = wizardContext.clusterType
    ? CloudProvidersFriendlyName[wizardContext.clusterType]
    : ''

  return (
    <WizardStep stepId="basic" label="Basic">
      <ValidatedForm
        onSubmit={onSubmit}
        triggerSubmit={triggerSubmit}
        title="Name Your Storage Class"
      >
        <TextField id="name" label="Name" info="Name for this storage class." required />
        <PicklistField
          DropdownComponent={ClusterPicklist}
          id="clusterId"
          label="Cluster"
          info="The cluster to deploy this storage class on."
          onChange={getParamsUpdater('clusterId')}
          value={params.clusterId}
          required
        />
        <TextField
          id="cloudProvider"
          label="Cloud provider"
          info="Cloud provider."
          disabled
          value={cloudProviderName}
        />
        {wizardContext.clusterType === 'aws' && (
          <PicklistField
            DropdownComponent={StorageTypePicklist}
            id="storageType"
            label="Storage Type"
            info="Select the storage type for this storage class. The list of available storage types is specific to the cloud provider that the cluster belongs to."
            required
          />
        )}
        {wizardContext.clusterType === 'local' && (
          <TextField
            id="provisioner"
            label="Provisioner"
            info="Name of provisioner to use"
            required
          />
        )}
        <CheckboxField
          id="isDefault"
          label="Use as Default Storage Class"
          info={defaultExists && 'A default storage class already exists on this cluster.'}
          disabled={defaultExists}
        />
      </ValidatedForm>
    </WizardStep>
  )
}

const CustomizeStep = ({ wizardContext, onSubmit, triggerSubmit }) => {
  const classes = useStyles()
  const { params, getParamsUpdater, updateParams } = useParams({ storageClassYaml: '' })

  // If any of the parameters change we need to update the YAML, but we also need to allow
  // the user to make overrides, so we are using useEffect.
  useEffect(() => {
    const storageClassYaml = getInitialStorageClassYaml(wizardContext)
    updateParams({ storageClassYaml })
  }, [
    wizardContext.name,
    wizardContext.clusterType,
    wizardContext.isDefault,
    wizardContext.storageType,
  ])

  return (
    <WizardStep stepId="customize" label="Customize" key={wizardContext}>
      <ValidatedForm
        onSubmit={onSubmit}
        triggerSubmit={triggerSubmit}
        title="Advanced Usage"
        link={
          <div>
            <FontAwesomeIcon className={classes.blueIcon} size="md">
              hdd
            </FontAwesomeIcon>{' '}
            <ExternalLink url={persistVolumesStorageClassesLink}>
              How do I configure a storage class?
            </ExternalLink>
          </div>
        }
      >
        <CodeMirror
          id="storageClassYaml"
          label="Storage Class YAML"
          options={codeMirrorOptions}
          onChange={getParamsUpdater('storageClassYaml')}
          value={params.storageClassYaml}
          required
        />
      </ValidatedForm>
    </WizardStep>
  )
}

const getInitialStorageClassYaml = (wizardContext) => {
  const values = {
    name: '',
    isDefault: false,
    provisioner: '',
    storageType: '',
    ...wizardContext,
  }
  const provisioner = `kubernetes.io/${
    values.clusterType === 'aws' ? 'aws-ebs' : values.provisioner
  }`
  const storageClass = {
    apiVersion: 'storage.k8s.io/v1',
    kind: 'StorageClass',
    metadata: {
      name: values.name,
      annotations: {
        'storageclass.kubernetes.io/is-default-class': values.isDefault.toString(),
      },
      labels: {
        'kubernetes.io/cluster-service': 'true',
      },
    },
    provisioner,
  }
  if (values.clusterType === 'local') {
    storageClass.provisioner = `kubernetes.io/${values.provisioner}`
  }
  if (values.clusterType === 'aws') {
    storageClass.parameters = {
      type: values.storageType,
    }
  }

  return yaml.safeDump(storageClass)
}

export const options = {
  cacheKey: storageClassesCacheKey,
  FormComponent: AddStorageClassForm,
  listUrl: '/ui/kubernetes/storage_classes',
  name: 'AddStorageClass',
  title: 'New Storage Class',
}

const { AddPage } = createAddComponents(options)

export default AddPage
