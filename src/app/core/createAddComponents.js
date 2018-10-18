import React from 'react'
import FormWrapper from 'core/common/FormWrapper'
import requiresAuthentication from 'openstack/util/requiresAuthentication'
import { withRouter } from 'react-router-dom'
import { withAppContext } from 'core/AppContext'
import { compose } from 'core/fp'

const createAddComponents = options => {
  const defaults = {}
  const {
    FormComponent,
    createFn,
    dataKey,
    initFn,
    listUrl,
    loaderFn,
    name,
    title,
  } = { ...defaults, ...options }

  class AddPageBase extends React.Component {
    handleAdd = async data => {
      const { setContext, context, history } = this.props
      try {
        const existing = await loaderFn({ setContext, context })
        if (initFn) {
          // Sometimes a component needs more than just a single GET API call.
          // This function allows for any amount of arbitrary initialization.
          await initFn(this.props)
        }
        const created = await createFn({ data, context, setContext })
        setContext({ [dataKey]: [...existing, ...created] })
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
