import * as Sentry from '@sentry/react'

/** Sentry is only initialized in production when DSN is provided */
export const isSentryEnabled = !!import.meta.env.VITE_SENTRY_DSN

export function initSentry() {
  if (!isSentryEnabled) return

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    release: 'iaas-app@2.2.0',

    // Only send errors, not performance data (free tier friendly)
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,

    // Filter out common non-actionable errors
    beforeSend(event) {
      const msg = event.exception?.values?.[0]?.value ?? ''
      // Ignore browser extension errors
      if (msg.includes('extension') || msg.includes('chrome-extension')) return null
      // Ignore ResizeObserver (benign browser quirk)
      if (msg.includes('ResizeObserver')) return null
      return event
    },
  })
}

/**
 * Captures an error in Sentry with optional context.
 * Safe to call even when Sentry is not initialized (no-op).
 */
export function captureError(error: unknown, context?: Record<string, unknown>) {
  console.error('[IAAS Error]', error, context)
  if (!isSentryEnabled) return
  if (error instanceof Error) {
    Sentry.captureException(error, context ? { extra: context } : undefined)
  } else {
    Sentry.captureMessage(String(error), { extra: context })
  }
}
