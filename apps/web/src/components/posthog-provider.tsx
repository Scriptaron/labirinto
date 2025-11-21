'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function CSPostHogProvider({
    children,
    apiKey,
    apiHost
}: {
    children: React.ReactNode
    apiKey: string
    apiHost: string
}) {
    useEffect(() => {
        if (apiKey && apiHost && !posthog.__loaded) {
            posthog.init(apiKey, {
                api_host: apiHost,
                person_profiles: 'identified_only',
                capture_pageview: false, // Handled by Next.js router usually, or manually
                capture_pageleave: true,
            })
        }
    }, [apiKey, apiHost])

    return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
