import 'jest-styled-components'
import 'core-js/stable'
import 'regenerator-runtime/runtime'
import React from 'react'
import userEvent from '@testing-library/user-event'

import { render, within, screen } from 'test-wrapper'

import IconSettingsMenu from './index'
import MockSettings from './__mock__/index'

test('Displays icon-settings-menu', async () => {
  const selected = MockSettings[0].name
  const setSelected = jest.fn()

  const { container } = await render(
    <IconSettingsMenu items={MockSettings} activeName={selected} setActive={setSelected} />
  )
  // Compare snapshot
  expect(container).toMatchSnapshot()

  // check if the tab is selected
  const activeElement = screen.getAllByRole('tab', { selected: true })[0]
  const activeLabel = within(activeElement).getByTestId('label')
  expect(activeLabel).toHaveTextContent(selected)

  // Fire click event and check that
  const nonSelectedItem = screen.getAllByRole('tab', { selected: false })[1]
  await userEvent.click(nonSelectedItem)
  expect(setSelected).toBeCalled()
})

test('Icon-settings-menu has focus', () => {
  const selected = MockSettings[0].name
  const setSelected = jest.fn()
  render(<IconSettingsMenu items={MockSettings} activeName={selected} setActive={setSelected} />)
  const [first, second] = screen.getAllByRole('tab')
  expect(document.body).toHaveFocus()
  userEvent.tab()
  expect(first).toHaveFocus()
  userEvent.tab()
  expect(second).toHaveFocus()
})
