import React, { useCallback } from 'react'
import FormWrapper from 'core/components/FormWrapper'
import createFormComponent from 'core/helpers/createFormComponent'
import useDataUpdater from 'core/hooks/useDataUpdater'
import useReactRouter from 'use-react-router'
import { getContextUpdater } from 'core/helpers/createContextUpdater'

const createAddComponents = options => {
  const {
    cacheKey,
    createFn = cacheKey ? getContextUpdater(cacheKey, 'create') : null,
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

  const AddPage = props => {
    const { history } = useReactRouter()
    const onComplete = useCallback(() => history.push(listUrl), [history])
    const [handleAdd, loading] = useDataUpdater(createFn, onComplete)

    return (
      <FormWrapper title={title} backUrl={listUrl}>
        <FormComponent {...props} loading={loading} onComplete={handleAdd} />
      </FormWrapper>
    )
  }

  AddPage.displayName = `Add${name}Page`

  return {
    AddPage,
  }
}

export default createAddComponents
