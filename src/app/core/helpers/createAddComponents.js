import React, { useCallback } from 'react'
import { withRouter } from 'react-router-dom'
import { compose } from 'app/utils/fp'
import FormWrapper from 'core/components/FormWrapper'
import createFormComponent from 'core/helpers/createFormComponent'
import requiresAuthentication from 'openstack/util/requiresAuthentication'
import useDataUpdater from 'core/hooks/useDataUpdater'

const createAddComponents = options => {
  const {
    createFn,
    formSpec,
    listUrl,
    name,
    title,
    displayName = `${name}Form`,
    FormComponent = formSpec ? createFormComponent({ ...formSpec, displayName }) : null,
  } = options

  if (!FormComponent) {
    throw new Error('Unable to display form, No FormComponent or formSpec specified')
  }

  const AddPageBase = props => {
    const onComplete = useCallback(() => props.history.push(listUrl), [props.history])
    const [handleAdd, loading] = useDataUpdater(createFn, onComplete)

    return (
      <FormWrapper title={title} backUrl={listUrl}>
        <FormComponent {...props} loading={loading} onComplete={handleAdd} />
      </FormWrapper>
    )
  }

  const AddPage = compose(
    withRouter,
    requiresAuthentication,
  )(AddPageBase)
  AddPage.displayName = `Add${name}Page`

  return {
    AddPage,
  }
}

export default createAddComponents
