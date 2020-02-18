import React from 'react'
import CardButton from 'core/components/buttons/CardButton'
import { cleanup, fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import TestThemeProvider from 'utils/TestThemeProvider'
import { TestId } from 'utils/testId'

describe('<CardButton />', () => {
  const handleClick = jest.fn()
  const text = 'Card Button'

  afterEach(cleanup)

  test('render', () => {
    const { getByTestId } = render(
      <TestThemeProvider>
        <CardButton>{text}</CardButton>
      </TestThemeProvider>,
    )
    expect(getByTestId(TestId.TEST_CARD_BUTTON)).toHaveTextContent(`+${text}`)
  })

  test('onClick', () => {
    const { getByTestId } = render(
      <TestThemeProvider>
        <CardButton onClick={handleClick}>{text}</CardButton>
      </TestThemeProvider>,
    )
    fireEvent.click(getByTestId(TestId.TEST_CARD_BUTTON))
    expect(handleClick).toBeCalledTimes(1)
  })

  test('disabled', () => {
    const { getByTestId } = render(
      <TestThemeProvider>
        <CardButton disabled>{text}</CardButton>
      </TestThemeProvider>,
    )

    expect(getByTestId(TestId.TEST_CARD_BUTTON)).toBeDisabled()
  })

  test('default children', () => {
    const { getByTestId } = render(
      <TestThemeProvider>
        <CardButton />
      </TestThemeProvider>,
    )

    expect(getByTestId(TestId.TEST_CARD_BUTTON)).toHaveTextContent('+')
  })

  test('Props: showPlus=false', () => {
    const { getByTestId } = render(
      <TestThemeProvider>
        <CardButton showPlus={false}>{text}</CardButton>
      </TestThemeProvider>,
    )

    expect(getByTestId(TestId.TEST_CARD_BUTTON)).toHaveTextContent(text)
  })
})
