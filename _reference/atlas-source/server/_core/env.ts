/** Portable environment contract. Supply only the integrations you choose to use. */
export const ENV = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.LLM_BASE_URL ?? "",
  forgeApiKey: process.env.LLM_API_KEY ?? "",
};
