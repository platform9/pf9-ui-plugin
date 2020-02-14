import React from 'react'
import PrevButton from 'core/components/buttons/PrevButton'
import { ThemeProvider } from '@material-ui/core/styles'
import { createShallow } from '@material-ui/core/test-utils'

describe('<PrevButton />', () => {
  let wrapper
  let shallow
  let mockCallBack

  beforeAll(() => {
    shallow = createShallow()
    mockCallBack = jest.fn()
    wrapper = shallow(
      <ThemeProvider theme={{}}>
        <PrevButton onClick={mockCallBack}>Back to list</PrevButton>
      </ThemeProvider>,
    )
  })

  it('render', () => {
    expect(wrapper.find(PrevButton)).toHaveLength(1)
  })

  it('onClick', () => {
    wrapper.find(PrevButton).simulate('click')
    expect(mockCallBack.mock.calls.length).toEqual(1)
    wrapper.find(PrevButton).simulate('click')
    expect(mockCallBack.mock.calls.length).toEqual(2)
  })

  it('disabled', () => {
    wrapper = shallow(
      <ThemeProvider theme={{}}>
        <PrevButton onClick={mockCallBack} disabled>
          Back to list
        </PrevButton>
      </ThemeProvider>,
    )
    expect(wrapper.find(PrevButton).props().disabled).toBeTruthy()
  })

  it('should display the correct children', () => {
    expect(wrapper.find(PrevButton).props().children).toEqual('Back to list')
  })
})
