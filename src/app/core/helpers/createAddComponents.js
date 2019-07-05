import React from 'react'
import { withRouter } from 'react-router-dom'
import { compose } from 'app/utils/fp'
import { withAppContext } from 'core/AppContext'
import FormWrapper from 'core/components/FormWrapper'
import createCRUDActions from 'core/helpers/createCRUDActions'
import createFormComponent from 'core/helpers/createFormComponent'
import requiresAuthentication from 'openstack/util/requiresAuthentication'
import { withToast } from 'core/providers/ToastProvider'

const createAddComponents = options => {
  const defaults = {}
  let {
    FormComponent,
    actions,
    createFn,
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
      const { history } = this.props
      try {
        await (loaderFn || crudActions.list)(this.props)
        if (initFn) {
          // Sometimes a component needs more than just a single GET API call.
          // This function allows for any amount of arbitrary initialization.
          await initFn(this.props)
        }
        await (createFn || crudActions.create)({ data, ...this.props })
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
    withToast,
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
