import { InfisicalSDK } from "@infisical/sdk";

let infisicalClient: InfisicalSDK | null = null;

export async function getInfisicalClient() {
  if (!infisicalClient) {
    const client = new InfisicalSDK();
    
    await client.auth().universalAuth.login({
      clientId: process.env.INFISICAL_CLIENT_ID!,
      clientSecret: process.env.INFISICAL_CLIENT_SECRET!,
    });
    
    infisicalClient = client;
  }
  return infisicalClient;
}

export async function getSecret(secretName: string) {
  const client = await getInfisicalClient();
  
  const secret = await client.secrets().getSecret({
    environment: process.env.INFISICAL_ENVIRONMENT || "dev",
    projectId: process.env.INFISICAL_PROJECT_ID!,
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
    NEXT_PUBLIC_POSTHOG_KEY: posthogKey,
    NEXT_PUBLIC_POSTHOG_WEBSITE: posthogWebsite,
  };
}
