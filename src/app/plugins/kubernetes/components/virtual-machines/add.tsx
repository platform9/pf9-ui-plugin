import React, { useCallback } from 'react'
import jsYaml from 'js-yaml'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import PicklistField from 'core/components/validatedForm/PicklistField'
import SubmitButton from 'core/components/SubmitButton'
import CodeMirror from 'core/components/validatedForm/CodeMirror'
import { codeMirrorOptions } from 'app/constants'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import NamespacePicklist from 'k8s/components/common/NamespacePicklist'
import useParams from 'core/hooks/useParams'
import useReactRouter from 'use-react-router'
import useDataUpdater from 'core/hooks/useDataUpdater'
import FormWrapper from 'core/components/FormWrapper'
import moize from 'moize'
import Progress from 'core/components/progress/Progress'
import { customValidator, requiredValidator } from 'core/utils/fieldValidators'
// import { makeStyles } from '@material-ui/styles'
// import Theme from 'core/themes/model'
import { virtualMachineActions } from './actions'
import { Route, routes } from 'core/utils/routes'
import { VirtualMachineCreateTypes } from './model'

// import newVM from './add-templates/new-vm.yaml'
// import importUrl from './add-templates/import-url.yaml'
// import importDisk from './add-templates/import-disk.yaml'
// import clonePVC from './add-templates/clone-pvc.yaml'
// import Button from 'core/elements/button'
import DocumentMeta from 'core/components/DocumentMeta'
import VMPicklist from './vm-picklist'

// const useStyles = makeStyles<Theme>((theme) => ({
//   templateButton: {
//     alignSelf: 'flex-start',
//   },
// }))

const findVMCreateType = (): VirtualMachineCreateTypes => {
  const currentRoute = Route.getCurrentRoute()
  if (currentRoute) {
    return (
      (currentRoute?.defaultParams?.createType as VirtualMachineCreateTypes) ||
      VirtualMachineCreateTypes.AddNew
    )
  }
  return VirtualMachineCreateTypes.AddNew
}
const formTitleByType = {
  [VirtualMachineCreateTypes.AddNew]: 'Create a New VM Instance',
  [VirtualMachineCreateTypes.ImportURL]: 'Add a VM - Import an Image from URL',
  [VirtualMachineCreateTypes.ImportDisk]: 'Add a VM - Import an Image on a Disk',
  [VirtualMachineCreateTypes.ClonePVC]: 'Add a VM - Cloning an Existing PVC',
}

// const yamlTemplates = {
//   [VirtualMachineCreateTypes.AddNew]: newVM,
//   [VirtualMachineCreateTypes.ImportURL]: importUrl,
//   [VirtualMachineCreateTypes.ImportDisk]: importDisk,
//   [VirtualMachineCreateTypes.ClonePVC]: clonePVC,
// }

const moizedYamlLoad = moize(jsYaml.safeLoad, {
  maxSize: 10,
})

const codeMirrorValidations = [
  requiredValidator,
  customValidator((yaml) => {
    try {
      moizedYamlLoad(yaml)
      return true
    } catch (err) {
      return false
    }
  }, 'Provided YAML code is invalid'),
  customValidator((yaml) => {
    try {
      const body = moizedYamlLoad(yaml)
      return body?.apiVersion?.toLowerCase() === 'kubevirt.io/v1'
    } catch (err) {
      return true
    }
  }, 'KubeVirt API version must be "kubevirt.io/v1"'),
  customValidator((yaml, formValues, rest) => {
    try {
      const body = moizedYamlLoad(yaml)
      return body?.kind === formValues.vmType
    } catch (err) {
      return true
    }
  }, 'KubeVirt API kind must match the Virtual Machine type'),
]

export const AddVirtualMachineForm = () => {
  const { history } = useReactRouter()
  const vmType = findVMCreateType()
  const formattedTitle = formTitleByType[vmType]
  const { params, getParamsUpdater } = useParams({
    clusterId: undefined,
    yaml: undefined,
    vmType: 'VirtualMachine',
  })
  const onComplete = useCallback(() => history.push(routes.virtualMachines.list.path()), [history])

  const [handleAdd, adding] = useDataUpdater(virtualMachineActions.create, onComplete)
  // const insertYamlTemplate = useCallback(
  //   () =>
  //     updateParams({
  //       yaml: yamlTemplates[vmType],
  //     }),
  //   [params],
  // )

  return (
    <FormWrapper title={formattedTitle} backUrl={routes.virtualMachines.list.path()}>
      <DocumentMeta title={formattedTitle} bodyClasses={['form-view']} />
      <Progress overlay loading={adding} renderContentOnMount>
        <ValidatedForm
          onSubmit={handleAdd}
          formActions={<SubmitButton>Create VM Instance</SubmitButton>}
        >
          <PicklistField
            DropdownComponent={ClusterPicklist}
            id="clusterId"
            label="Cluster"
            info="The cluster to deploy this resource on"
            onChange={getParamsUpdater('clusterId')}
            required
          />
          <PicklistField
            DropdownComponent={NamespacePicklist}
            disabled={!params.clusterId}
            id="namespace"
            label="Namespace"
            info="The namespace to deploy this resource on"
            clusterId={params.clusterId}
            required
          />
          <PicklistField
            DropdownComponent={VMPicklist}
            id="vmType"
            label="VM Type"
            info="The kubeVirt kind, VirtualMachine or VirtualMachineInstance"
            required
          />
          <CodeMirror
            id="yaml"
            label="YAML Resource"
            validations={codeMirrorValidations}
            onChange={getParamsUpdater('yaml')}
            value={params.yaml}
            options={codeMirrorOptions}
          />
          {/* <Button
            className={classes.templateButton}
            variant="light"
            color="secondary"
            onClick={insertYamlTemplate}
            type="button"
          >
            Use YAML Template
          </Button> */}
        </ValidatedForm>
      </Progress>
    </FormWrapper>
  )
}

export default AddVirtualMachineForm
