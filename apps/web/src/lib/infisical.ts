import { InfisicalSDK } from "@infisical/sdk";

let infisicalClient: InfisicalSDK | null = null;

export async function getInfisicalClient() {
  // Se não houver credenciais, retorna null (evita crash no build)
  if (!process.env.INFISICAL_CLIENT_ID || !process.env.INFISICAL_CLIENT_SECRET) {
    console.warn("Infisical credentials not found. Skipping SDK initialization.");
    return null;
  }

  if (!infisicalClient) {
    const client = new InfisicalSDK();

    try {
      await client.auth().universalAuth.login({
        clientId: process.env.INFISICAL_CLIENT_ID,
        clientSecret: process.env.INFISICAL_CLIENT_SECRET,
      });
      infisicalClient = client;
    } catch (error) {
      console.error("Failed to authenticate with Infisical:", error);
      return null;
    }
  }
  return infisicalClient;
}

export async function getSecret(secretName: string) {
  // Prefer environment variables injected by Infisical CLI or standard .env
  if (process.env[secretName]) {
    return process.env[secretName];
  }

  const client = await getInfisicalClient();

  if (!client) {
    return undefined;
  }

  try {
    const secret = await client.secrets().getSecret({
      environment: process.env.INFISICAL_ENVIRONMENT || "dev",
      projectId: process.env.INFISICAL_PROJECT_ID!,
      secretName,
    });
    return secret.secretValue;
  } catch (error) {
    console.error(`Failed to fetch secret ${secretName}:`, error);
    return undefined;
  }
}

// Função helper para carregar as variáveis do PostHog
export async function loadPostHogEnv() {
  const [posthogKey, posthogWebsite] = await Promise.all([
    getSecret("POSTHOG_KEY"),
    getSecret("POSTHOG_WEBSITE"),
  ]);

  return {
    NEXT_PUBLIC_POSTHOG_KEY: posthogKey,
    NEXT_PUBLIC_POSTHOG_WEBSITE: posthogWebsite,
  };
}
