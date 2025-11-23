import { InfisicalSDK } from "@infisical/sdk";

let infisicalClient: InfisicalSDK | null = null;

export async function getInfisicalClient() {
  if (!infisicalClient) {
    const client = new InfisicalSDK({
      siteUrl: import.meta.env.PUBLIC_INFISICAL_URL || "https://app.infisical.com",
    });

    await client.auth().universalAuth.login({
      clientId: import.meta.env.INFISICAL_CLIENT_ID!,
      clientSecret: import.meta.env.INFISICAL_CLIENT_SECRET!,
    });

    infisicalClient = client;
  }
  return infisicalClient;
}

export async function getSecret(secretName: string) {
  const client = await getInfisicalClient();

  if (client) {
    try {
      const secret = await client.secrets().getSecret({
        environment: import.meta.env.INFISICAL_ENVIRONMENT || "dev",
        projectId: import.meta.env.INFISICAL_PROJECT_ID!,
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
    PUBLIC_POSTHOG_KEY: posthogKey,
    PUBLIC_POSTHOG_WEBSITE: posthogWebsite,
  };
}
