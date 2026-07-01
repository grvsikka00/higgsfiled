/**
 * Higgsfield REST API client.
 * Auth header: "Authorization: Key KEY_ID:KEY_SECRET"
 * Base URL:    https://platform.higgsfield.ai
 */

const BASE_URL = "https://platform.higgsfield.ai";

function buildClient(keyId, keySecret) {
  const authHeader = `Key ${keyId}:${keySecret}`;

  async function request(method, path, body) {
    const url = `${BASE_URL}${path}`;
    const init = {
      method,
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }
    const res = await fetch(url, init);
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }
    if (!res.ok) {
      throw new Error(
        `Higgsfield API error ${res.status}: ${JSON.stringify(json)}`
      );
    }
    return json;
  }

  return {
    // Check balance / auth
    async getBalance() {
      return request("GET", "/api/v1/balance");
    },

    // Submit a generation job (image or video)
    async submit(modelPath, args, webhookUrl) {
      const body = { model: modelPath, input: args };
      if (webhookUrl) body.webhook = webhookUrl;
      return request("POST", "/api/v1/generate", body);
    },

    // Poll job status
    async getStatus(jobId) {
      return request("GET", `/api/v1/jobs/${jobId}`);
    },

    // Cancel a job
    async cancel(jobId) {
      return request("POST", `/api/v1/jobs/${jobId}/cancel`);
    },

    // List past jobs
    async listJobs(page = 1, pageSize = 20) {
      return request(
        "GET",
        `/api/v1/jobs?page=${page}&page_size=${pageSize}`
      );
    },

    // Upload an image (base64) and get a CDN URL back
    async uploadImageBase64(base64Data, mimeType = "image/png") {
      return request("POST", "/api/v1/upload", {
        data: base64Data,
        content_type: mimeType,
      });
    },

    // List available Soul character IDs
    async listSoulIds() {
      return request("GET", "/api/v1/souls");
    },

    // Create a Soul character from reference images
    async createSoulId(name, referenceImageUrls) {
      return request("POST", "/api/v1/souls", {
        name,
        reference_images: referenceImageUrls,
      });
    },

    // Get a single Soul character
    async getSoulId(soulId) {
      return request("GET", `/api/v1/souls/${soulId}`);
    },

    // Delete a Soul character
    async deleteSoulId(soulId) {
      return request("DELETE", `/api/v1/souls/${soulId}`);
    },

    // List available motion presets (for DOP image-to-video)
    async listMotions() {
      return request("GET", "/api/v1/motions");
    },

    // List Soul style presets
    async listSoulStyles() {
      return request("GET", "/api/v1/soul-styles");
    },

    // Poll until a job completes (or fails), with timeout
    async waitForJob(jobId, { pollInterval = 3000, maxWaitMs = 300000 } = {}) {
      const start = Date.now();
      while (Date.now() - start < maxWaitMs) {
        const status = await this.getStatus(jobId);
        const state = (status.status || status.state || "").toLowerCase();
        if (
          state === "completed" ||
          state === "failed" ||
          state === "nsfw" ||
          state === "cancelled"
        ) {
          return status;
        }
        await new Promise((r) => setTimeout(r, pollInterval));
      }
      throw new Error(`Job ${jobId} timed out after ${maxWaitMs}ms`);
    },
  };
}

export { buildClient };
