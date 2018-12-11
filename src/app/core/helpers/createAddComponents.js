import React from 'react'
import FormWrapper from 'core/common/FormWrapper'
import requiresAuthentication from 'openstack/util/requiresAuthentication'
import createCRUDActions from 'core/helpers/createCRUDActions'
import createFormComponent from 'core/helpers/createFormComponent'
import { withRouter } from 'react-router-dom'
import { withAppContext } from 'core/AppContext'
import { compose } from 'core/fp'

const createAddComponents = options => {
  const defaults = {}
  let {
    FormComponent,
    actions,
    createFn,
    dataKey,
    formSpec,
    initFn,
    listUrl,
    loaderFn,
    name,
    title,
  } = { ...defaults, ...options }

  if (!FormComponent && formSpec) {
    formSpec.displayName = `${options.name}Form`
    FormComponent = createFormComponent(formSpec)
  }

  const crudActions = actions ? createCRUDActions(actions) : null

  class AddPageBase extends React.Component {
    handleAdd = async data => {
      const { setContext, context, history } = this.props
      try {
        const existing = await (loaderFn || crudActions.list)({ setContext, context })
        if (initFn) {
          // Sometimes a component needs more than just a single GET API call.
          // This function allows for any amount of arbitrary initialization.
          await initFn(this.props)
        }
        const created = await (createFn || crudActions.create)({ data, context, setContext })
        setContext({ [dataKey]: [...existing, created] })
        history.push(listUrl)
      } catch (err) {
        console.error(err)
      }
    }

    render () {
      return (
        <FormWrapper title={title} backUrl={listUrl}>
          <FormComponent {...this.props} onComplete={this.handleAdd} />
        </FormWrapper>
      )
    }
  }

  const AddPage = compose(
    withAppContext,
    withRouter,
    requiresAuthentication,
  )(AddPageBase)
  AddPage.displayName = `Add${name}Page`

  return {
    AddPage,
  }
}

export default createAddComponents
