import { ANALYTICS_ENABLED } from '@/utils/env'

export interface AnalyticsEvent {
  name: string
  properties?: Record<string, string | number | boolean>
}

export interface AnalyticsProvider {
  trackEvent: (event: AnalyticsEvent) => void
  trackPageView: (path: string) => void
}

/**
 * No-op provider used whenever analytics is disabled (the default). Keeping
 * a real provider interface means a privacy-friendly backend (e.g. Plausible
 * or Umami) can be wired in later by implementing AnalyticsProvider and
 * swapping it in here — gated behind VITE_ENABLE_ANALYTICS so it stays off
 * unless a deployment explicitly turns it on.
 */
const noopProvider: AnalyticsProvider = {
  trackEvent: () => {},
  trackPageView: () => {},
}

let activeProvider: AnalyticsProvider = noopProvider

export function isAnalyticsEnabled(): boolean {
  return ANALYTICS_ENABLED
}

export function setAnalyticsProvider(provider: AnalyticsProvider): void {
  activeProvider = provider
}

export function trackEvent(event: AnalyticsEvent): void {
  if (!ANALYTICS_ENABLED) return
  activeProvider.trackEvent(event)
}

export function trackPageView(path: string): void {
  if (!ANALYTICS_ENABLED) return
  activeProvider.trackPageView(path)
}
