import React from 'react'
import { cleanup, fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import TestThemeProvider from 'utils/TestThemeProvider'

import SubmitButton from 'core/components/buttons/SubmitButton'
import { TestId } from 'utils/testId'

describe('<SubmitButton />', () => {
  const handleClick = jest.fn()
  const text = 'Submit Button'

  afterEach(cleanup)

  test('render', () => {
    const { getByTestId } = render(
      <TestThemeProvider>
        <SubmitButton>{text}</SubmitButton>
      </TestThemeProvider>,
    )
    expect(getByTestId(TestId.TEST_SUBMIT_BUTTON)).toHaveTextContent(text)
  })

  test('onClick', () => {
    const { getByTestId } = render(
      <TestThemeProvider>
        <SubmitButton onClick={handleClick}>{text}</SubmitButton>
      </TestThemeProvider>,
    )
    fireEvent.click(getByTestId(TestId.TEST_SUBMIT_BUTTON))
    expect(handleClick).toBeCalledTimes(1)
  })

  test('disabled', () => {
    const { getByTestId } = render(
      <TestThemeProvider>
        <SubmitButton disabled>{text}</SubmitButton>
      </TestThemeProvider>,
    )

    expect(getByTestId(TestId.TEST_SUBMIT_BUTTON)).toBeDisabled()
  })

  test('type=submit', () => {
    const { getByTestId } = render(
      <TestThemeProvider>
        <SubmitButton>{text}</SubmitButton>
      </TestThemeProvider>,
    )

    expect(getByTestId(TestId.TEST_SUBMIT_BUTTON)).toHaveAttribute('type', 'submit')
  })

  test('default children', () => {
    const { getByTestId } = render(
      <TestThemeProvider>
        <SubmitButton />
      </TestThemeProvider>,
    )

    expect(getByTestId(TestId.TEST_SUBMIT_BUTTON)).toHaveTextContent('Submit')
  })
})
