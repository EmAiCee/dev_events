// app/instrumentation.client.ts
import posthog from 'posthog-js'

export function register() {
  if (typeof window !== 'undefined') {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      defaults: '2025-05-24',  // optional defaults
      autocapture: true,
      capture_pageview: false
    })
  }
}
