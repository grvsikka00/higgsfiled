const { createHiggsfieldClient } = require('@higgsfield/client/v2');

function resolveCredentials() {
  if (process.env.HF_CREDENTIALS) {
    return { credentials: process.env.HF_CREDENTIALS };
  }
  if (process.env.HF_API_KEY && process.env.HF_API_SECRET) {
    return { apiKey: process.env.HF_API_KEY, apiSecret: process.env.HF_API_SECRET };
  }
  throw new Error(
    'Missing Higgsfield credentials. Set HF_CREDENTIALS="KEY_ID:KEY_SECRET" or both HF_API_KEY and HF_API_SECRET.'
  );
}

function getHiggsfieldClient() {
  return createHiggsfieldClient({
    ...resolveCredentials(),
    baseURL: process.env.HF_BASE_URL || 'https://platform.higgsfield.ai',
  });
}

module.exports = { getHiggsfieldClient };
