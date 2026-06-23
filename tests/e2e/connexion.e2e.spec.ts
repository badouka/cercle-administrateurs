import { test, expect } from '@playwright/test'
import { getPayload } from 'payload'
import config from '../../src/payload.config'

const BASE  = 'http://localhost:3000'
const EMAIL = `e2e-login-${Date.now()}@example.com`
const PWD   = 'TestPassword123!'

test.describe('Connexion frontend', () => {
  let userId: number

  test.beforeAll(async () => {
    const payload = await getPayload({ config })
    const u = await payload.create({
      collection: 'users',
      data: { email: EMAIL, password: PWD, role: 'membre' },
      overrideAccess: true,
    })
    userId = u.id
  })

  test.afterAll(async () => {
    const payload = await getPayload({ config })
    await payload.delete({ collection: 'users', id: userId, overrideAccess: true })
  })

  test('une connexion valide redirige vers /dashboard', async ({ page }) => {
    await page.goto(`${BASE}/connexion`)
    await page.fill('#email', EMAIL)
    await page.fill('#password', PWD)
    await page.click('button[type="submit"]')

    await page.waitForURL(/\/dashboard/, { timeout: 15000 })
    expect(page.url()).toContain('/dashboard')
  })

  // Régression : un cookie payload-token périmé/invalide ne doit pas provoquer
  // de boucle de redirection /connexion ↔ /dashboard. La page de connexion doit
  // rester accessible et le cookie invalide être purgé.
  test('un token invalide ne bloque pas la page de connexion', async ({ page, context }) => {
    await context.addCookies([{
      name:  'payload-token',
      value: 'invalid.stale.token',
      url:   BASE,
    }])

    await page.goto(`${BASE}/connexion`)
    await page.waitForLoadState('networkidle')

    // On reste bien sur /connexion (pas de boucle vers /dashboard)
    expect(page.url()).toContain('/connexion')
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })
})
