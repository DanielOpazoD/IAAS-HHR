import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @sentry/react before importing
vi.mock('@sentry/react', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}))

describe('sentry config', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
  })

  it('captureError logs to console even without Sentry', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { captureError } = await import('@/config/sentry')
    const err = new Error('test')
    captureError(err, { foo: 'bar' })
    expect(spy).toHaveBeenCalledWith('[IAAS Error]', err, { foo: 'bar' })
    spy.mockRestore()
  })

  it('captureError handles string errors', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { captureError } = await import('@/config/sentry')
    captureError('string error')
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('isSentryEnabled is false when no DSN', async () => {
    const { isSentryEnabled } = await import('@/config/sentry')
    expect(isSentryEnabled).toBe(false)
  })
})
