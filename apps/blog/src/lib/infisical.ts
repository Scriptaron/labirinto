import { InfisicalSDK } from "@infisical/sdk";

let infisicalClient: InfisicalSDK | null = null;

export async function getInfisicalClient() {
  if (!infisicalClient) {
    const client = new InfisicalSDK();

    await client.auth().universalAuth.login({
      clientId: import.meta.env.INFISICAL_CLIENT_ID!,
      clientSecret: import.meta.env.INFISICAL_CLIENT_SECRET!,
    });

    infisicalClient = client;
  }
  return infisicalClient;
}

export async function getSecret(secretName: string) {
  // Prefer environment variables injected by Infisical CLI or standard .env
  if (import.meta.env[secretName]) {
    return import.meta.env[secretName];
  }

  const client = await getInfisicalClient();

  const secret = await client.secrets().getSecret({
    environment: import.meta.env.INFISICAL_ENVIRONMENT || "dev",
    projectId: import.meta.env.INFISICAL_PROJECT_ID!,
    secretName,
  });

  return secret.secretValue;
}

// Função helper para carregar as variáveis do PostHog
export async function loadPostHogEnv() {
  const [posthogKey, posthogWebsite] = await Promise.all([
    getSecret("POSTHOG_KEY"),
    getSecret("POSTHOG_WEBSITE"),
  ]);

  return {
    PUBLIC_POSTHOG_KEY: posthogKey,
    PUBLIC_POSTHOG_WEBSITE: posthogWebsite,
  };
}
