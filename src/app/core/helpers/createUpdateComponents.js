import React, { useState, useEffect, useCallback } from 'react'
import useReactRouter from 'use-react-router'
import FormWrapper from 'core/components/FormWrapper'
import Progress from 'core/components/progress/Progress'
import { getContextLoader } from 'core/helpers/createContextLoader'
import { getContextUpdater } from 'core/helpers/createContextUpdater'
import useDataLoader from 'core/hooks/useDataLoader'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { pathEq, assocPath, isEmpty } from 'ramda'
import { emptyObj } from 'utils/fp'

const createUpdateComponents = (options) => {
  const {
    cacheKey,
    loaderFn = cacheKey ? getContextLoader(cacheKey) : null,
    updateFn = cacheKey ? getContextUpdater(cacheKey, 'update') : null,

    FormComponent,
    initFn,
    listUrl,
    name,

    // This should match the id in the route.  Ex:
    // '/prefix/entity/:entityId' would be 'entityId'
    routeParamKey = 'id',
    title,
    uniqueIdentifier = 'id',
  } = options
  const uniqueIdentifierPath = uniqueIdentifier.split('.')

  const UpdatePage = (props) => {
    const { match, history } = useReactRouter()
    const [initialValues, setInitialValues] = useState(emptyObj)
    const [data, loading] = useDataLoader(loaderFn)
    const [update, updating] = useDataUpdater(updateFn, (successfulUpdate) => {
      if (successfulUpdate) {
        history.push(listUrl)
      }
    })
    const id = match.params[routeParamKey]

    useEffect(() => {
      if (data.length) {
        const currentItem = data.find(pathEq(uniqueIdentifierPath, id))
        if (currentItem) {
          setInitialValues(currentItem)
        } else {
          console.error(`Item with id ${id} not found`)
        }
      }
    }, [data])

    const handleComplete = useCallback(
      async (data) => {
        if (initFn) {
          // Sometimes a component needs more than just a single GET API call.
          // This function allows for any amount of arbitrary initialization.
          await initFn(props)
        }
        update(assocPath(uniqueIdentifierPath, id, data))
      },
      [id],
    )

    return (
      <FormWrapper title={title} backUrl={listUrl}>
        <Progress
          message={`${updating ? 'Updating data...' : 'Loading data...'}`}
          loading={isEmpty(initialValues) || loading || updating}
        >
          <FormComponent {...props} onComplete={handleComplete} initialValues={initialValues} />
        </Progress>
      </FormWrapper>
    )
  }

  UpdatePage.displayName = `Update${name}Page`

  return {
    UpdatePage,
  }
}

export default createUpdateComponents
