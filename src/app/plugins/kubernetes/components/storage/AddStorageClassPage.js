import React, { useEffect } from 'react'
import yaml from 'js-yaml'
import createAddComponents from 'core/helpers/createAddComponents'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import FormWrapper from 'core/components/FormWrapper'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import PicklistField from 'core/components/validatedForm/PicklistField'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import CodeMirror from 'core/components/validatedForm/CodeMirror'
import { codeMirrorOptions, allKey } from 'app/constants'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import storageClassesActions, { storageClassesCacheKey } from './actions'
import useParams from 'core/hooks/useParams'
import useDataLoader from 'core/hooks/useDataLoader'

const initialContext = {
  isDefault: false,
}

export const AddStorageClassForm = ({ onComplete }) =>
  <Wizard onComplete={onComplete} context={initialContext}>
    {({ wizardContext, setWizardContext, onNext }) =>
      <>
        <BasicStep onSubmit={setWizardContext} triggerSubmit={onNext} />
        <CustomizeStep
          wizardContext={wizardContext}
          onSubmit={setWizardContext}
          triggerSubmit={onNext}
        />
      </>
    }
  </Wizard>

const BasicStep = ({ onSubmit, triggerSubmit }) => {
  const listStorageClassesParams = {
    clusterId: allKey,
    healthyClusters: true,
  }
  const [storageClasses] = useDataLoader(storageClassesActions.list, listStorageClassesParams)
  const { params, getParamsUpdater } = useParams()
  const defaultStorageClassForCurrentCluster = storageClass =>
    storageClass.clusterId === params.clusterId &&
    storageClass.metadata.annotations['storageclass.kubernetes.io/is-default-class'] === 'true'
  const defaultExists = !!storageClasses.find(defaultStorageClassForCurrentCluster)

  return (
    <WizardStep stepId="basic" label="Basic">
      <p>
        Create a new storage class on a specific cluster by specifying the storage type that maps to the cloud provider for that cluster.
      </p>
      <br />
      <FormWrapper title="Add Storage Class">
        <ValidatedForm onSubmit={onSubmit} triggerSubmit={triggerSubmit}>
          <TextField
            id="name"
            label="Name"
            info="Name for this storage class."
            required
          />
          <PicklistField
            DropdownComponent={ClusterPicklist}
            id="clusterId"
            label="Cluster"
            info="The cluster to deploy this storage class on."
            onChange={getParamsUpdater('clusterId')}
            value={params.clusterId}
            onlyHealthyClusters
            required
          />
          <CheckboxField
            id="isDefault"
            label="Use as Default Storage Class"
            info={defaultExists && 'A default storage class already exists on this cluster.'}
            disabled={defaultExists}
          />
        </ValidatedForm>
      </FormWrapper>
    </WizardStep>
  )
}

const CustomizeStep = ({ wizardContext, onSubmit, triggerSubmit }) => {
  const storageClassYaml = getInitialStorageClassYaml(wizardContext)
  const { params, getParamsUpdater, updateParams } = useParams({ storageClassYaml })
  useEffect(() => updateParams({ storageClassYaml }), [wizardContext])

  return (
    <WizardStep stepId="customize" label="Customize" key={wizardContext}>
      <p>
        Optionally edit the storage class YAML for advanced configuration. See this <a href='https://kubernetes.io/docs/concepts/storage/persistent-volumes/#storageclasses'>article</a> for more information.
      </p>
      <p>
        <b>NOTE:</b> In case of a conflict with options selected on the previous page, changes you make here will override them.
      </p>
      <br />
      <FormWrapper title="Customize">
        <ValidatedForm onSubmit={onSubmit} triggerSubmit={triggerSubmit}>
          <CodeMirror
            id="storageClassYaml"
            label="Storage Class YAML"
            options={codeMirrorOptions}
            onChange={getParamsUpdater('storageClassYaml')}
            initialValue={params.storageClassYaml}
            required
          />
        </ValidatedForm>
      </FormWrapper>
    </WizardStep>
  )
}

const getInitialStorageClassYaml = (wizardContext) => {
  const isInvalidContext = wizardContext.name == null || wizardContext.isDefault == null
  if (isInvalidContext) {
    return
  }

  const storageClass = {
    apiVersion: 'storage.k8s.io/v1',
    kind: 'StorageClass',
    metadata: {
      name: wizardContext.name,
      annotations: {
        'storageclass.kubernetes.io/is-default-class': wizardContext.isDefault.toString(),
      },
      labels: {
        'kubernetes.io/cluster-service': true.toString(),
      },
    },
    provisioner: 'kubernetes.io/aws-ebs',
    parameters: {
      type: 'gp2', // TODO: Add picklist for type
    },
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
