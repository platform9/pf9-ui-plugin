import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import CloseButton from 'core/components/buttons/CloseButton'
import { cleanup, fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import TestThemeProvider from 'utils/TestThemeProvider'
import { TestId } from 'utils/testId'

describe('<CloseButton />', () => {
  const handleClick = jest.fn()
  const text = 'Close Button'

  afterEach(cleanup)

  test('render', () => {
    const { getByTestId, container } = render(
      <TestThemeProvider>
        <CloseButton tooltip={text} />
      </TestThemeProvider>,
    )

    const parent = container.firstElementChild
    const child = getByTestId(TestId.TEST_CLOSE_BUTTON_ICON)

    expect(child).toHaveAttribute('title', text)
    expect(parent).toContainElement(child)
  })

  test('onClick', () => {
    const { container } = render(
      <TestThemeProvider>
        <CloseButton onClick={handleClick}>{text}</CloseButton>
      </TestThemeProvider>,
    )
    const parent = container.firstElementChild

    fireEvent.click(parent)
    expect(handleClick).toBeCalledTimes(1)
  })

  test('default children', () => {
    const { getByTestId, container } = render(
      <TestThemeProvider>
        <CloseButton />
      </TestThemeProvider>,
    )

    const parent = container.firstElementChild
    const child = getByTestId(TestId.TEST_CLOSE_BUTTON_ICON)
    expect(parent).toContainElement(child)
  })

  test('to', () => {
    const { getByTestId, container } = render(
      <TestThemeProvider>
        <Router>
          <CloseButton to="backtoList">{text}</CloseButton>
        </Router>
      </TestThemeProvider>,
    )

    const parent = container.firstElementChild
    const child = getByTestId(TestId.TEST_CLOSE_BUTTON_LINK)
    const grandChild = getByTestId(TestId.TEST_CLOSE_BUTTON_ICON)

    expect(parent).toContainElement(child)
    expect(child).toContainElement(grandChild)
  })
})
