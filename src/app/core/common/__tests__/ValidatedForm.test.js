import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import ValidatedForm from '../ValidatedForm'

Enzyme.configure({ adapter: new Adapter() })

describe('ValidatedForm', () => {
  it('empty fields spec returns just a blank form', () => {
    const wrapper = shallow(<ValidatedForm fields={[]} />)
    expect(wrapper.find('form').exists()).toEqual(true)
  })

  it('renders whatever the renderProp function wants', () => {
    const wrapper = shallow(
      <ValidatedForm fields={[]}>
        {() => <div id="whatever">Whatever</div>}
      </ValidatedForm>
    )
    expect(wrapper.find('form>div').html()).toEqual('<div id="whatever">Whatever</div>')
  })

  it('renderField helper reduces boilerplate', () => {
    const fieldSpec = [{ id: 'name', type: 'string' }]
    const wrapper = shallow(
      <ValidatedForm fields={fieldSpec}>
        {({ fields, renderField }) => (
          <React.Fragment>{ renderField(fields[0]) }</React.Fragment>
        )}
      </ValidatedForm>
    )
    expect(wrapper.find('form input').matchesElement(<input type="text" id="name" />)).toEqual(true)
  })

  it('supplies a "props" prop containing value and onChange for each field', () => {
    const fieldSpec = [{ id: 'name', type: 'string' }]
    const fn = jest.fn()
    shallow(<ValidatedForm fields={fieldSpec}>{fn}</ValidatedForm>)
    expect(fn).toHaveBeenCalled()
    const fields = fn.mock.calls[0][0].fields
    expect(fields[0].props.onChange).toBeDefined()
  })

  it('sets value from initialValue', () => {
    const fieldSpec = [{ id: 'name', type: 'string', initialValue: 'foo' }]
    const fn = jest.fn()
    shallow(<ValidatedForm fields={fieldSpec}>{fn}</ValidatedForm>)
    expect(fn).toHaveBeenCalled()
    const fields = fn.mock.calls[0][0].fields
    expect(fields[0].props.value).toEqual('foo')
  })

  it('the onChange function passed to the renderProp fields updates state', () => {
    const fieldSpec = [{ id: 'name', type: 'string' }]
    const wrapper = shallow(
      <ValidatedForm fields={fieldSpec}>
        {({ fields, renderField }) => (
          <React.Fragment>{ renderField(fields[0]) }</React.Fragment>
        )}
      </ValidatedForm>
    )
    wrapper.find('input#name').simulate('change', { target: { value: 'changed' } })
    expect(wrapper.find('input#name').prop('value')).toEqual('changed')
  })
})
