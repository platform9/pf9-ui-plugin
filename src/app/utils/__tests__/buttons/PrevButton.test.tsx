import React from 'react'
import PrevButton from 'core/components/buttons/PrevButton'
import { cleanup, fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import TestThemeProvider from 'utils/TestThemeProvider'
import { TestId } from 'utils/testId'

describe('<PrevButton />', () => {
  const handleClick = jest.fn()
  const text = 'Back Button'

  afterEach(cleanup)

  test('render', () => {
    const { getByTestId } = render(
      <TestThemeProvider>
        <PrevButton>{text}</PrevButton>
      </TestThemeProvider>,
    )
    expect(getByTestId(TestId.TEST_PREVIOUS_BUTTON)).toHaveTextContent(text)
  })

  test('onClick', () => {
    const { getByTestId } = render(
      <TestThemeProvider>
        <PrevButton onClick={handleClick}>{text}</PrevButton>
      </TestThemeProvider>,
    )
    fireEvent.click(getByTestId(TestId.TEST_PREVIOUS_BUTTON))
    expect(handleClick).toBeCalledTimes(1)
  })

  test('disabled', () => {
    const { getByTestId } = render(
      <TestThemeProvider>
        <PrevButton disabled>{text}</PrevButton>
      </TestThemeProvider>,
    )

    expect(getByTestId(TestId.TEST_PREVIOUS_BUTTON)).toBeDisabled()
  })

  test('default children', () => {
    const { getByTestId } = render(
      <TestThemeProvider>
        <PrevButton />
      </TestThemeProvider>,
    )

    expect(getByTestId(TestId.TEST_PREVIOUS_BUTTON)).toHaveTextContent('Back')
  })

  test('render back icon', () => {
    const { getByTestId } = render(
      <TestThemeProvider>
        <PrevButton />
      </TestThemeProvider>,
    )

    const parent = getByTestId(TestId.TEST_PREVIOUS_BUTTON)
    const child = getByTestId(TestId.TEST_PREVIOUS_BUTTON_ICON)
    expect(parent).toContainElement(child)
  })
})
