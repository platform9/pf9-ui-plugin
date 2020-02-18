import React from 'react'
import { cleanup, fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import TestThemeProvider from 'utils/TestThemeProvider'
import CreateButton from 'core/components/buttons/CreateButton'
import { TestId } from 'utils/testId'

describe('<CreateButton />', () => {
  const handleClick = jest.fn()
  const text = 'Create'

  afterEach(cleanup)

  test('render', () => {
    const { getByTestId } = render(
      <TestThemeProvider>
        <CreateButton>Create</CreateButton>
      </TestThemeProvider>,
    )
    expect(getByTestId(TestId.TEST_CREATE_BUTTON)).toHaveTextContent(`+ ${text}`)
  })

  test('onClick', () => {
    const { getByTestId } = render(
      <TestThemeProvider>
        <CreateButton onClick={handleClick}>{text}</CreateButton>
      </TestThemeProvider>,
    )
    fireEvent.click(getByTestId(TestId.TEST_CREATE_BUTTON))
    expect(handleClick).toBeCalledTimes(1)
  })

  test('disabled', () => {
    const { getByTestId } = render(
      <TestThemeProvider>
        <CreateButton disabled>{text}</CreateButton>
      </TestThemeProvider>,
    )

    expect(getByTestId(TestId.TEST_CREATE_BUTTON)).toBeDisabled()
  })
})
