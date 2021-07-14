import ExternalLink from 'core/components/ExternalLink'
import { ErrorMessage } from 'core/components/validatedForm/ErrorMessage'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import useDataLoader from 'core/hooks/useDataLoader'
import { pmkCliOverviewLink } from 'k8s/links'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { loadNodes } from '../nodes/actions'
import { checkNodesForClockDrift, clockDriftErrorMessage } from '../nodes/helpers'
import { INodesSelector } from '../nodes/model'
import ClusterHostChooser from './bareos/ClusterHostChooser'

interface AddNodeStepProps {
  wizardContext: any
  setWizardContext: any
  onNext: any
  title: string
  nodeFieldId: string
  nodeSelection?: 'single' | 'multiple'
  nodeFilterFn: (node: INodesSelector) => boolean
  nodeValidations: Array<any>
  isSingleNodeCluster: boolean
  pollForNodes?: boolean
  required?: boolean
}

const AddNodeStep = ({
  wizardContext,
  setWizardContext,
  onNext,
  title,
  nodeFieldId,
  nodeSelection = 'single',
  nodeFilterFn,
  nodeValidations,
  isSingleNodeCluster,
  pollForNodes = true,
  required = false,
}: AddNodeStepProps) => {
  const [errorMessage, setErrorMessage] = useState(null)
  const validatorRef = useRef(null)
  const [allNodes] = useDataLoader(loadNodes)

  const setupValidator = (validate) => {
    validatorRef.current = { validate }
  }

  const submitStep = useCallback(() => {
    const isValid = validatorRef.current.validate()
    if (!isValid) {
      return false
    }

    const selectedNodeUuids = wizardContext[nodeFieldId] || []
    const hasClockDrift = checkNodesForClockDrift(selectedNodeUuids, allNodes)
    if (hasClockDrift) {
      setErrorMessage(clockDriftErrorMessage)
      return false
    }
    setErrorMessage(null)
    return true
  }, [wizardContext])

  useEffect(() => {
    onNext(submitStep)
  }, [submitStep])

  return (
    <ValidatedForm
      fullWidth
      initialValues={wizardContext}
      onSubmit={setWizardContext}
      triggerSubmit={setupValidator}
      title={title}
      link={
        <ExternalLink textVariant="caption2" url={pmkCliOverviewLink}>
          Not Seeing Any Nodes?
        </ExternalLink>
      }
    >
      <ClusterHostChooser
        selection={nodeSelection}
        id={nodeFieldId}
        filterFn={nodeFilterFn}
        validations={nodeValidations}
        isSingleNodeCluster={isSingleNodeCluster}
        pollForNodes={pollForNodes}
        onChange={(value) => setWizardContext({ [nodeFieldId]: value })}
        value={wizardContext[nodeFieldId]}
        required={required}
      />
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
    </ValidatedForm>
  )
}

export default AddNodeStep
