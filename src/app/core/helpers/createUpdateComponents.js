import React from 'react'
import { withRouter } from 'react-router-dom'
import { compose } from 'app/utils/fp'
import { withAppContext } from 'core/AppContext'
import FormWrapper from 'core/components/FormWrapper'
import Progress from 'core/components/progress/Progress'
import requiresAuthentication from 'openstack/util/requiresAuthentication'

const createUpdateComponents = options => {
  const defaults = {
    uniqueIdentifier: 'id',
    routeParamKey: 'id',
  }

  const {
    FormComponent,
    updateFn,
    dataKey,
    initFn,
    listUrl,
    loaderFn,
    name,

    // This should match the id in the route.  Ex:
    // '/prefix/entity/:entityId' would be 'entityId'
    routeParamKey,
    title,
    uniqueIdentifier,
  } = { ...defaults, ...options }

  class UpdatePageBase extends React.Component {
    state = { initialValue: null }

    async componentDidMount () {
      const { context, getContext, setContext, match } = this.props
      const id = match.params[routeParamKey]
      const existing = await loaderFn({ setContext, getContext, context })
      const initialValue = existing.find(x => x[uniqueIdentifier] === id)
      this.setState({ initialValue })
    }

    handleComplete = async data => {
      const { setContext, getContext, context, history, match } = this.props
      const id = match.params[routeParamKey]
      try {
        const existing = await loaderFn({ setContext, getContext, context })
        if (initFn) {
          // Sometimes a component needs more than just a single GET API call.
          // This function allows for any amount of arbitrary initialization.
          await initFn(this.props)
        }
        const updated = await updateFn({ id, data, context, getContext, setContext })
        const updatedList = existing.map(x => x[uniqueIdentifier] !== id ? x : updated)
        setContext({ [dataKey]: updatedList })
        history.push(listUrl)
      } catch (err) {
        console.error(err)
      }
    }

    render () {
      const { initialValue } = this.state

      return (
        <Progress message="Fetching data..." loading={!initialValue}>
          <FormWrapper title={title} backUrl={listUrl}>
            <FormComponent {...this.props}
              onComplete={this.handleComplete}
              initialValues={initialValue} />
          </FormWrapper>
        </Progress>
      )
    }
  }

  const UpdatePage = compose(
    withAppContext,
    withRouter,
    requiresAuthentication,
  )(UpdatePageBase)
  UpdatePage.displayName = `Update${name}Page`

  return {
    UpdatePage,
  }
}

export default createUpdateComponents
