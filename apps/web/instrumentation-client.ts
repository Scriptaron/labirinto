import posthog from "posthog-js"

// As variáveis NEXT_PUBLIC_POSTHOG_KEY e NEXT_PUBLIC_POSTHOG_WEBSITE 
// devem ser definidas no Infisical e carregadas via CLI ou SDK
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_WEBSITE || "/ingest",
  ui_host: "https://eu.posthog.com",
  person_profiles: 'identified_only',
  capture_pageview: false,
  capture_pageleave: true,
  debug: process.env.NODE_ENV === "development",
});