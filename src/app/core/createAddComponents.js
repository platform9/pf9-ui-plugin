import React from 'react'
import FormWrapper from 'core/common/FormWrapper'
import requiresAuthentication from 'openstack/util/requiresAuthentication'
import { withRouter } from 'react-router-dom'
import { withAppContext } from 'core/AppContext'
import { compose } from 'core/fp'

const createAddComponents = options => {
  const defaults = {}
  const {
    dataKey,
    FormComponent,
    listUrl,
    loaderFn,
    createFn,
    name,
    title,
  } = { ...defaults, ...options }

  class AddPageBase extends React.Component {
    handleAdd = async data => {
      const { setContext, context, history } = this.props
      try {
        const existing = await loaderFn({ setContext, context })
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
          <FormComponent onComplete={this.handleAdd} />
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
