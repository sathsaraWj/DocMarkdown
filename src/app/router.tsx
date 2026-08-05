import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { Route, Routes } from 'react-router-dom'

import { PageLoadingFallback } from '@/components/common/PageLoadingFallback'
import { SiteLayout } from '@/components/layout/SiteLayout'
import { ConverterPage } from '@/pages/ConverterPage'

const TemplatesPage = lazy(() => import('@/pages/TemplatesPage'))
const MarkdownGuidePage = lazy(() => import('@/pages/MarkdownGuidePage'))
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'))
const TermsPage = lazy(() => import('@/pages/TermsPage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<PageLoadingFallback />}>{element}</Suspense>
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<ConverterPage />} />
        <Route path="templates" element={withSuspense(<TemplatesPage />)} />
        <Route path="markdown-guide" element={withSuspense(<MarkdownGuidePage />)} />
        <Route path="privacy" element={withSuspense(<PrivacyPage />)} />
        <Route path="terms" element={withSuspense(<TermsPage />)} />
        <Route path="about" element={withSuspense(<AboutPage />)} />
        <Route path="contact" element={withSuspense(<ContactPage />)} />
        <Route path="*" element={withSuspense(<NotFoundPage />)} />
      </Route>
    </Routes>
  )
}
