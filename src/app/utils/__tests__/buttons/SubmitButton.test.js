import React from 'react'
import SubmitButton from 'core/components/buttons/SubmitButton'
import { ThemeProvider } from '@material-ui/core/styles'
import { createShallow } from '@material-ui/core/test-utils'

describe('<SubmitButton />', () => {
  let wrapper
  let shallow
  let mockCallBack

  beforeAll(() => {
    shallow = createShallow()
    mockCallBack = jest.fn()
    wrapper = shallow(
      <ThemeProvider theme={{}}>
        <SubmitButton onClick={mockCallBack}>Submit Button</SubmitButton>
      </ThemeProvider>,
    )
  })

  it('render', () => {
    expect(wrapper.find(SubmitButton)).toHaveLength(1)
  })

  it('onClick', () => {
    wrapper.find(SubmitButton).simulate('click')
    expect(mockCallBack.mock.calls.length).toEqual(1)
  })

  it('disabled', () => {
    wrapper = shallow(
      <ThemeProvider theme={{}}>
        <SubmitButton onClick={mockCallBack} disabled>
          Submit Button
        </SubmitButton>
      </ThemeProvider>,
    )
    expect(wrapper.find(SubmitButton).props().disabled).toBeTruthy()
  })

  it('should display the correct children', () => {
    expect(wrapper.find(SubmitButton).props().children).toEqual('Submit Button')
  })
})
