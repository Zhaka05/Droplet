import { test, expect } from '@playwright/test'

test.describe('Daily goal', () => {
  test('changing the limit on Goals shows the new value on Home', async ({ page }) => {
    const newGoal = 45

    await page.goto('/')

    await page.getByRole('button', { name: 'Limit' }).click()
    await expect(page.getByRole('heading', { name: 'Set Your Limit' })).toBeVisible()

    const goalInput = page.locator('input[type="number"]')
    await goalInput.fill(String(newGoal))

    await page.getByRole('button', { name: 'Save Limit' }).click()
    await expect(page.getByRole('button', { name: /Saved/ })).toBeVisible()

    await page.getByRole('button', { name: 'Home' }).click()
    await expect(
      page.getByText(new RegExp(`of ${newGoal} gal`))
    ).toBeVisible()
  })
})
