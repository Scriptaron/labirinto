import { InfisicalSDK } from "@infisical/sdk";

let infisicalClient: InfisicalSDK | null = null;

export async function getInfisicalClient() {
  // Se não houver credenciais, retorna null (evita crash no build)
  if (!process.env.INFISICAL_CLIENT_ID || !process.env.INFISICAL_CLIENT_SECRET) {
    console.warn("Infisical credentials not found. Skipping SDK initialization.");
    return null;
  }

  if (!infisicalClient) {
    const client = new InfisicalSDK({
      siteUrl: process.env.NEXT_PUBLIC_INFISICAL_URL || "https://app.infisical.com",
    });

    try {
      await client.auth().universalAuth.login({
        clientId: process.env.INFISICAL_CLIENT_ID,
        clientSecret: process.env.INFISICAL_CLIENT_SECRET,
      });
      infisicalClient = client;
    } catch (error) {
      return null;
    }
  }
  return infisicalClient;
}

export async function getSecret(secretName: string) {
  const client = await getInfisicalClient();

  if (client) {
    try {
      const secret = await client.secrets().getSecret({
        environment: process.env.INFISICAL_ENVIRONMENT || "dev",
        projectId: process.env.INFISICAL_PROJECT_ID!,
        secretName,
      });
      if (secret.secretValue) {
        return secret.secretValue;
      }
    } catch (error) {
      // fallback below
    }
  }

  if (process.env[secretName]) {
    return process.env[secretName];
  }

  return undefined;
}

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
