import { test, expect } from '@playwright/test'

test.describe('Buzzer alert', () => {
  test('after simulated flow passes the limit, the waste alert appears', async ({ page }) => {
    test.setTimeout(45_000)

    await page.goto('/')
    await page.getByRole('button', { name: 'Devices' }).click()

    const lowFlowSim = page.getByRole('button', { name: /Low Flow/ }).first()
    if (await lowFlowSim.isDisabled()) {
      test.skip(true, 'Simulator is locked (WebSocket connected to backend); run e2e with backend off or Vite from Playwright.')
    }

    await lowFlowSim.click()
    await expect(
      page.getByRole('heading', { name: 'Water Waste Alert!' })
    ).toBeVisible({ timeout: 15_000 })

    await expect(page.getByText(/over 3 second/)).toBeVisible()
    await page.getByRole('button', { name: 'Stop Session' }).click()
    await expect(page.getByRole('heading', { name: 'Water Waste Alert!' })).toBeHidden()
  })
})
