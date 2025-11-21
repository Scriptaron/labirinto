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
        if (apiKey && apiHost) {
            posthog.init(apiKey, {
                api_host: apiHost,
                person_profiles: 'identified_only',
                capture_pageview: false, // Handled by Next.js router usually, or manually
            })
        }
    }, [apiKey, apiHost])

    return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
