import React, { useCallback, useEffect, useRef } from 'react'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { loadResMgrHosts } from 'k8s/components/infrastructure/common/actions'
import ListTableField from 'core/components/validatedForm/ListTableField'
import useDataLoader from 'core/hooks/useDataLoader'
import PollingData from 'core/components/PollingData'
import { IUseDataLoader } from 'k8s/components/infrastructure/nodes/model'
import { addRole } from 'openstack/components/resmgr/actions'
import { Host } from 'api-client/resmgr.model'
import { useDispatch } from 'react-redux'
import { notificationActions, NotificationType } from 'core/notifications/notificationReducers'

// Put any for now to let me proceed
interface Props {
  wizardContext: any
  setWizardContext: any
  onNext: any
  title: string
  setSubmitting: any
}

const columns = [
  { id: 'info.hostname', label: 'Hostname' },
  { id: 'ipPreview', label: 'IP Address' },
  { id: 'info.os_info', label: 'Operating System' },
]

const AuthorizeHostStep = ({
  wizardContext,
  setWizardContext,
  onNext,
  title,
  setSubmitting,
}: Props) => {
  const dispatch = useDispatch()
  const validatorRef = useRef(null)

  const [hosts, hostsLoading, reloadHosts]: IUseDataLoader<Host> = useDataLoader(
    loadResMgrHosts,
  ) as any

  const setupValidator = (validate) => {
    validatorRef.current = { validate }
  }

  const submitStep = useCallback(async () => {
    const isValid = validatorRef.current.validate()
    if (!isValid) {
      // don't let the user progress to next step
      return false
    }

    try {
      setSubmitting(true)
      await addRole(wizardContext.selectedHost[0].id, 'pf9-onboarding', {})
    } catch (err) {
      setSubmitting(false)
      dispatch(
        notificationActions.registerNotification({
          title: 'Authorize Host Error',
          message: err.message,
          type: NotificationType.error,
        }),
      )
      return false
    }

    setSubmitting(false)
    return true
  }, [wizardContext])

  useEffect(() => {
    onNext(submitStep)
  }, [submitStep])

  // Minor bug: when the list of hosts is refreshed, prior selection
  // is unselected (all objects are replaced, old selected is no
  // longer there) but old selection is still valid in the wizard context.
  return (
    <>
      <div>Authorize the node to become the Bare Metal controller</div>
      <ValidatedForm
        initialValues={wizardContext}
        onSubmit={setWizardContext}
        triggerSubmit={setupValidator}
        title={title}
      >
        {({ setFieldValue, values }) => (
          <>
            <PollingData
              loading={hostsLoading}
              onReload={reloadHosts}
              refreshDuration={1000 * 60}
            />
            <ListTableField
              id="selectedHost"
              data={hosts}
              onChange={(value) => setWizardContext({ selectedHost: value })}
              value={wizardContext.selectedHost}
              columns={columns}
              loading={false}
            />
          </>
        )}
      </ValidatedForm>
    </>
  )
}

export default AuthorizeHostStep
