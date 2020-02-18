import React from 'react'
import NextButton from 'core/components/buttons/NextButton'
import { cleanup, fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import TestThemeProvider from 'utils/TestThemeProvider'
import { TestId } from 'utils/testId'

describe('<NextButton />', () => {
  const handleClick = jest.fn()
  const text = 'Next Button'

  afterEach(cleanup)

  test('render', () => {
    const { getByTestId } = render(
      <TestThemeProvider>
        <NextButton>{text}</NextButton>
      </TestThemeProvider>,
    )
    expect(getByTestId(TestId.TEST_NEXT_BUTTON)).toHaveTextContent(text)
  })

  test('onClick', () => {
    const { getByTestId } = render(
      <TestThemeProvider>
        <NextButton onClick={handleClick}>{text}</NextButton>
      </TestThemeProvider>,
    )
    fireEvent.click(getByTestId(TestId.TEST_NEXT_BUTTON))
    expect(handleClick).toBeCalledTimes(1)
  })

  test('disabled', () => {
    const { getByTestId } = render(
      <TestThemeProvider>
        <NextButton disabled>{text}</NextButton>
      </TestThemeProvider>,
    )

    expect(getByTestId(TestId.TEST_NEXT_BUTTON)).toBeDisabled()
  })

  test('default children', () => {
    const { getByTestId } = render(
      <TestThemeProvider>
        <NextButton />
      </TestThemeProvider>,
    )

    expect(getByTestId(TestId.TEST_NEXT_BUTTON)).toHaveTextContent('Next')
  })

  test('render forward icon', () => {
    const { getByTestId } = render(
      <TestThemeProvider>
        <NextButton showForward />
      </TestThemeProvider>,
    )

    const parent = getByTestId(TestId.TEST_NEXT_BUTTON)
    const child = getByTestId(TestId.TEST_NEXT_BUTTON_ICON)
    expect(parent).toContainElement(child)
  })
})
