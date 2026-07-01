#!/usr/bin/env node
/**
 * Higgsfield MCP Server
 * Exposes Higgsfield AI image/video generation as MCP tools.
 *
 * Auth env vars (pick one format):
 *   HF_CREDENTIALS=KEY_ID:KEY_SECRET
 *   HF_API_KEY_ID=...  HF_API_KEY_SECRET=...
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { buildClient } from "./higgsfield.js";
import { MODELS, filterModels, findModel } from "./models.js";

// ── Credentials ──────────────────────────────────────────────────────────────

function loadCredentials() {
  const combined = process.env.HF_CREDENTIALS;
  if (combined) {
    const parts = combined.split(":");
    if (parts.length === 2) return { keyId: parts[0], keySecret: parts[1] };
  }
  const keyId = process.env.HF_API_KEY_ID;
  const keySecret = process.env.HF_API_KEY_SECRET;
  if (keyId && keySecret) return { keyId, keySecret };

  throw new Error(
    "Higgsfield credentials not found. Set HF_CREDENTIALS=KEY_ID:KEY_SECRET " +
      "or HF_API_KEY_ID + HF_API_KEY_SECRET environment variables."
  );
}

const { keyId, keySecret } = loadCredentials();
const hf = buildClient(keyId, keySecret);

// ── MCP Server ───────────────────────────────────────────────────────────────

const server = new McpServer({
  name: "higgsfield",
  version: "1.0.0",
});

// ── Tool: list_models ────────────────────────────────────────────────────────

server.tool(
  "list_models",
  "List available Higgsfield AI models. Optionally filter by kind.",
  {
    kind: z
      .enum(["text-to-image", "text-to-video", "image-to-video", "speech-to-video"])
      .optional()
      .describe("Filter by generation type"),
  },
  async ({ kind }) => {
    const models = filterModels(kind);
    const lines = models.map(
      (m) =>
        `**${m.name}** (\`${m.id}\`)\n  Kind: ${m.kind}\n  ${m.description}\n  Params: ${m.params.join(", ")}`
    );
    return {
      content: [
        {
          type: "text",
          text: `## Available Higgsfield Models (${models.length})\n\n${lines.join("\n\n")}`,
        },
      ],
    };
  }
);

// ── Tool: get_balance ────────────────────────────────────────────────────────

server.tool(
  "get_balance",
  "Check your Higgsfield API credit balance.",
  {},
  async () => {
    const data = await hf.getBalance();
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

// ── Tool: generate_image ─────────────────────────────────────────────────────

server.tool(
  "generate_image",
  "Generate an image using a Higgsfield text-to-image model. Returns a job ID; use get_job_status to poll.",
  {
    model_id: z
      .string()
      .describe('Model ID, e.g. "flux-pro/kontext/max/text-to-image". Use list_models to browse.'),
    prompt: z.string().describe("Text prompt describing the image to generate."),
    width: z.number().int().optional().describe("Output width in pixels (default: 1024)."),
    height: z.number().int().optional().describe("Output height in pixels (default: 1024)."),
    steps: z.number().int().optional().describe("Diffusion steps (default: model-specific)."),
    seed: z.number().int().optional().describe("Random seed for reproducibility."),
    soul_id: z.string().optional().describe("Soul character ID for soul-based models."),
    style: z.string().optional().describe("Style preset (for Soul models)."),
    wait: z
      .boolean()
      .optional()
      .describe("If true, poll until complete and return result URLs (max 5 min). Default: false."),
    webhook_url: z.string().url().optional().describe("Webhook URL for async completion callbacks."),
  },
  async ({ model_id, prompt, width, height, steps, seed, soul_id, style, wait, webhook_url }) => {
    const model = findModel(model_id);
    if (!model) {
      return {
        content: [
          {
            type: "text",
            text: `Unknown model "${model_id}". Run list_models to see available models.`,
          },
        ],
        isError: true,
      };
    }
    if (model.kind !== "text-to-image") {
      return {
        content: [
          {
            type: "text",
            text: `Model "${model_id}" is kind "${model.kind}", not "text-to-image". Use generate_video for video models.`,
          },
        ],
        isError: true,
      };
    }

    const args = { prompt };
    if (width) args.width = width;
    if (height) args.height = height;
    if (steps) args.steps = steps;
    if (seed !== undefined) args.seed = seed;
    if (soul_id) args.soul_id = soul_id;
    if (style) args.style = style;

    const job = await hf.submit(model_id, args, webhook_url);
    const jobId = job.id || job.job_id || job.request_id;

    if (wait && jobId) {
      const result = await hf.waitForJob(jobId);
      return {
        content: [
          {
            type: "text",
            text: `## Image Generation Complete\n\n**Job ID:** ${jobId}\n**Status:** ${result.status}\n\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `## Image Job Submitted\n\n**Job ID:** ${jobId}\n\nUse \`get_job_status\` with this ID to poll for results.\n\n\`\`\`json\n${JSON.stringify(job, null, 2)}\n\`\`\``,
        },
      ],
    };
  }
);

// ── Tool: generate_video ─────────────────────────────────────────────────────

server.tool(
  "generate_video",
  "Generate a video using a Higgsfield text-to-video or image-to-video model.",
  {
    model_id: z
      .string()
      .describe('Model ID, e.g. "v1/image2video/dop" or "sora/v2/text-to-video". Use list_models to browse.'),
    prompt: z.string().describe("Text prompt describing the video content or motion."),
    image_url: z
      .string()
      .url()
      .optional()
      .describe("Source image URL for image-to-video models."),
    motion: z.string().optional().describe("Motion preset (for DOP model). Use list_motions to browse."),
    duration: z.number().optional().describe("Video duration in seconds."),
    resolution: z.string().optional().describe("Resolution, e.g. '720p', '1080p'."),
    seed: z.number().int().optional().describe("Random seed for reproducibility."),
    wait: z
      .boolean()
      .optional()
      .describe("If true, poll until complete and return result URLs (max 5 min). Default: false."),
    webhook_url: z.string().url().optional().describe("Webhook URL for async completion callbacks."),
  },
  async ({ model_id, prompt, image_url, motion, duration, resolution, seed, wait, webhook_url }) => {
    const model = findModel(model_id);
    if (!model) {
      return {
        content: [
          {
            type: "text",
            text: `Unknown model "${model_id}". Run list_models to see available models.`,
          },
        ],
        isError: true,
      };
    }

    const args = { prompt };
    if (image_url) args.image_url = image_url;
    if (motion) args.motion = motion;
    if (duration) args.duration = duration;
    if (resolution) args.resolution = resolution;
    if (seed !== undefined) args.seed = seed;

    const job = await hf.submit(model_id, args, webhook_url);
    const jobId = job.id || job.job_id || job.request_id;

    if (wait && jobId) {
      const result = await hf.waitForJob(jobId, { maxWaitMs: 600000 });
      return {
        content: [
          {
            type: "text",
            text: `## Video Generation Complete\n\n**Job ID:** ${jobId}\n**Status:** ${result.status}\n\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `## Video Job Submitted\n\n**Job ID:** ${jobId}\n\nUse \`get_job_status\` with this ID to poll for results.\n\n\`\`\`json\n${JSON.stringify(job, null, 2)}\n\`\`\``,
        },
      ],
    };
  }
);

// ── Tool: generate_speech_video ──────────────────────────────────────────────

server.tool(
  "generate_speech_video",
  "Generate a talking-head video: animate a portrait image to speak audio.",
  {
    image_url: z.string().url().describe("URL of the portrait/face image."),
    audio_url: z.string().url().describe("URL of the audio file (MP3/WAV)."),
    prompt: z.string().optional().describe("Optional prompt for additional style guidance."),
    wait: z.boolean().optional().describe("Poll until complete (max 5 min). Default: false."),
    webhook_url: z.string().url().optional().describe("Webhook URL for async completion callbacks."),
  },
  async ({ image_url, audio_url, prompt, wait, webhook_url }) => {
    const args = { image_url, audio_url };
    if (prompt) args.prompt = prompt;

    const job = await hf.submit("v1/speak/higgsfield", args, webhook_url);
    const jobId = job.id || job.job_id || job.request_id;

    if (wait && jobId) {
      const result = await hf.waitForJob(jobId, { maxWaitMs: 600000 });
      return {
        content: [
          {
            type: "text",
            text: `## Speech Video Complete\n\n**Job ID:** ${jobId}\n**Status:** ${result.status}\n\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `## Speech Video Job Submitted\n\n**Job ID:** ${jobId}\n\nUse \`get_job_status\` to poll for results.\n\n\`\`\`json\n${JSON.stringify(job, null, 2)}\n\`\`\``,
        },
      ],
    };
  }
);

// ── Tool: get_job_status ─────────────────────────────────────────────────────

server.tool(
  "get_job_status",
  "Check the status of a Higgsfield generation job and retrieve output URLs when complete.",
  {
    job_id: z.string().describe("Job ID returned by generate_image, generate_video, or generate_speech_video."),
    wait: z
      .boolean()
      .optional()
      .describe("If true, poll until the job finishes (max 10 min). Default: false (single check)."),
  },
  async ({ job_id, wait }) => {
    if (wait) {
      const result = await hf.waitForJob(job_id, { maxWaitMs: 600000 });
      return {
        content: [
          {
            type: "text",
            text: `## Job Complete\n\n**Job ID:** ${job_id}\n**Status:** ${result.status}\n\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``,
          },
        ],
      };
    }

    const status = await hf.getStatus(job_id);
    return {
      content: [
        {
          type: "text",
          text: `## Job Status\n\n**Job ID:** ${job_id}\n**Status:** ${status.status || status.state || "unknown"}\n\n\`\`\`json\n${JSON.stringify(status, null, 2)}\n\`\`\``,
        },
      ],
    };
  }
);

// ── Tool: cancel_job ─────────────────────────────────────────────────────────

server.tool(
  "cancel_job",
  "Cancel a queued or in-progress Higgsfield generation job.",
  {
    job_id: z.string().describe("Job ID to cancel."),
  },
  async ({ job_id }) => {
    const result = await hf.cancel(job_id);
    return {
      content: [
        {
          type: "text",
          text: `## Job Cancelled\n\n**Job ID:** ${job_id}\n\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``,
        },
      ],
    };
  }
);

// ── Tool: list_jobs ──────────────────────────────────────────────────────────

server.tool(
  "list_jobs",
  "List your recent Higgsfield generation jobs.",
  {
    page: z.number().int().optional().describe("Page number (default: 1)."),
    page_size: z.number().int().optional().describe("Results per page (default: 20, max: 100)."),
  },
  async ({ page = 1, page_size = 20 }) => {
    const result = await hf.listJobs(page, page_size);
    return {
      content: [
        {
          type: "text",
          text: `## Jobs (page ${page})\n\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``,
        },
      ],
    };
  }
);

// ── Tool: upload_image ───────────────────────────────────────────────────────

server.tool(
  "upload_image",
  "Upload a base64-encoded image to Higgsfield's CDN and get back a URL for use in generation.",
  {
    data_base64: z.string().describe("Base64-encoded image data (without data: URI prefix)."),
    mime_type: z
      .string()
      .optional()
      .describe('MIME type, e.g. "image/png", "image/jpeg". Default: image/png.'),
  },
  async ({ data_base64, mime_type = "image/png" }) => {
    const result = await hf.uploadImageBase64(data_base64, mime_type);
    return {
      content: [
        {
          type: "text",
          text: `## Image Uploaded\n\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``,
        },
      ],
    };
  }
);

// ── Tool: list_soul_characters ───────────────────────────────────────────────

server.tool(
  "list_soul_characters",
  "List your saved Higgsfield Soul character IDs (custom person references for generation).",
  {},
  async () => {
    const result = await hf.listSoulIds();
    return {
      content: [
        {
          type: "text",
          text: `## Soul Characters\n\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``,
        },
      ],
    };
  }
);

// ── Tool: create_soul_character ──────────────────────────────────────────────

server.tool(
  "create_soul_character",
  "Create a new Higgsfield Soul character from reference image URLs (for consistent person generation).",
  {
    name: z.string().describe("Name for this Soul character."),
    reference_image_urls: z
      .array(z.string().url())
      .min(1)
      .describe("One or more reference image URLs of the person."),
  },
  async ({ name, reference_image_urls }) => {
    const result = await hf.createSoulId(name, reference_image_urls);
    return {
      content: [
        {
          type: "text",
          text: `## Soul Character Created\n\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``,
        },
      ],
    };
  }
);

// ── Tool: delete_soul_character ──────────────────────────────────────────────

server.tool(
  "delete_soul_character",
  "Delete a saved Higgsfield Soul character.",
  {
    soul_id: z.string().describe("Soul character ID to delete."),
  },
  async ({ soul_id }) => {
    const result = await hf.deleteSoulId(soul_id);
    return {
      content: [
        {
          type: "text",
          text: `## Soul Character Deleted\n\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``,
        },
      ],
    };
  }
);

// ── Tool: list_motions ───────────────────────────────────────────────────────

server.tool(
  "list_motions",
  "List available motion presets for the DOP image-to-video model.",
  {},
  async () => {
    const result = await hf.listMotions();
    return {
      content: [
        {
          type: "text",
          text: `## Available Motions\n\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``,
        },
      ],
    };
  }
);

// ── Tool: list_soul_styles ───────────────────────────────────────────────────

server.tool(
  "list_soul_styles",
  "List available style presets for Soul image generation.",
  {},
  async () => {
    const result = await hf.listSoulStyles();
    return {
      content: [
        {
          type: "text",
          text: `## Available Soul Styles\n\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``,
        },
      ],
    };
  }
);

// ── Start ────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
