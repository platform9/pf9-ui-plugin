import React from 'react'
import CancelButton from 'core/components/buttons/CancelButton'
import { cleanup, fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import TestThemeProvider from 'utils/TestThemeProvider'
import { TestId } from 'utils/testId'

describe('<CancelButton />', () => {
  const handleClick = jest.fn()
  const text = 'Cancel Button'

  afterEach(cleanup)

  test('render', () => {
    const { getByTestId } = render(
      <TestThemeProvider>
        <CancelButton>{text}</CancelButton>
      </TestThemeProvider>,
    )
    expect(getByTestId(TestId.TEST_CANCEL_BUTTON)).toHaveTextContent(text)
  })

  test('onClick', () => {
    const { getByTestId } = render(
      <TestThemeProvider>
        <CancelButton onClick={handleClick}>{text}</CancelButton>
      </TestThemeProvider>,
    )
    fireEvent.click(getByTestId(TestId.TEST_CANCEL_BUTTON))
    expect(handleClick).toBeCalledTimes(1)
  })

  test('disabled', () => {
    const { getByTestId } = render(
      <TestThemeProvider>
        <CancelButton disabled>{text}n</CancelButton>
      </TestThemeProvider>,
    )

    expect(getByTestId(TestId.TEST_CANCEL_BUTTON)).toBeDisabled()
  })

  test('default children', () => {
    const { getByTestId } = render(
      <TestThemeProvider>
        <CancelButton />
      </TestThemeProvider>,
    )

    expect(getByTestId(TestId.TEST_CANCEL_BUTTON)).toHaveTextContent('Cancel')
  })
})
