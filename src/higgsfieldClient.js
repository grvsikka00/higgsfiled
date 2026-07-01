const { HiggsfieldClient } = require('@higgsfield/client');

function resolveCredentials() {
  if (process.env.HF_CREDENTIALS) {
    const [apiKey, apiSecret] = process.env.HF_CREDENTIALS.split(':');
    if (apiKey && apiSecret) {
      return { apiKey, apiSecret };
    }
  }
  if (process.env.HF_API_KEY && process.env.HF_API_SECRET) {
    return { apiKey: process.env.HF_API_KEY, apiSecret: process.env.HF_API_SECRET };
  }
  throw new Error(
    'Missing Higgsfield credentials. Set HF_CREDENTIALS="KEY_ID:KEY_SECRET" or both HF_API_KEY and HF_API_SECRET.'
  );
}

function getHiggsfieldClient() {
  return new HiggsfieldClient({
    ...resolveCredentials(),
    baseURL: process.env.HF_BASE_URL || 'https://platform.higgsfield.ai',
  });
}

module.exports = { getHiggsfieldClient };
