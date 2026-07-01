/**
 * Known Higgsfield model catalog.
 * Each entry: { id, name, kind, description, params }
 * kind: "text-to-image" | "text-to-video" | "image-to-video" | "speech-to-video"
 */

export const MODELS = [
  // ── Text-to-Image ────────────────────────────────────────────────────
  {
    id: "flux-pro/kontext/max/text-to-image",
    name: "Flux Pro Kontext Max",
    kind: "text-to-image",
    description: "Highest-quality Flux text-to-image with rich prompt adherence.",
    params: ["prompt", "width", "height", "steps", "seed"],
  },
  {
    id: "flux-pro/text-to-image",
    name: "Flux Pro",
    kind: "text-to-image",
    description: "Flux Pro text-to-image generation.",
    params: ["prompt", "width", "height", "steps", "seed"],
  },
  {
    id: "flux-dev/text-to-image",
    name: "Flux Dev",
    kind: "text-to-image",
    description: "Faster Flux variant, good for iteration.",
    params: ["prompt", "width", "height", "steps", "seed"],
  },
  {
    id: "bytedance/seedream/v4/text-to-image",
    name: "Seedream v4",
    kind: "text-to-image",
    description: "ByteDance Seedream v4 image generation.",
    params: ["prompt", "width", "height", "seed"],
  },
  {
    id: "v1/text2image/soul",
    name: "Soul Text-to-Image",
    kind: "text-to-image",
    description: "Generate images using a Soul character reference.",
    params: ["prompt", "soul_id", "style", "seed"],
  },

  // ── Image-to-Video ───────────────────────────────────────────────────
  {
    id: "v1/image2video/dop",
    name: "DOP Image-to-Video",
    kind: "image-to-video",
    description: "Animate a still image with Higgsfield DOP (Director of Photography) motion controls.",
    params: ["image_url", "prompt", "motion", "seed"],
  },
  {
    id: "kling/v2.1/image-to-video/standard",
    name: "Kling 2.1 Standard",
    kind: "image-to-video",
    description: "Kling 2.1 standard image-to-video.",
    params: ["image_url", "prompt", "duration", "seed"],
  },
  {
    id: "kling/v2.1/image-to-video/pro",
    name: "Kling 2.1 Pro",
    kind: "image-to-video",
    description: "Kling 2.1 pro image-to-video, higher quality.",
    params: ["image_url", "prompt", "duration", "seed"],
  },
  {
    id: "kling/v3.0/image-to-video",
    name: "Kling 3.0",
    kind: "image-to-video",
    description: "Kling 3.0 latest image-to-video.",
    params: ["image_url", "prompt", "duration", "seed"],
  },
  {
    id: "seedance/v1/image-to-video/lite",
    name: "Seedance v1 Lite",
    kind: "image-to-video",
    description: "ByteDance Seedance v1 Lite image-to-video.",
    params: ["image_url", "prompt", "seed"],
  },
  {
    id: "seedance/v1/image-to-video/pro",
    name: "Seedance v1 Pro",
    kind: "image-to-video",
    description: "ByteDance Seedance v1 Pro image-to-video.",
    params: ["image_url", "prompt", "seed"],
  },
  {
    id: "wan/v2.1/image-to-video/480p",
    name: "Wan 2.1 480p",
    kind: "image-to-video",
    description: "Wan 2.1 image-to-video at 480p.",
    params: ["image_url", "prompt", "seed"],
  },
  {
    id: "wan/v2.1/image-to-video/720p",
    name: "Wan 2.1 720p",
    kind: "image-to-video",
    description: "Wan 2.1 image-to-video at 720p.",
    params: ["image_url", "prompt", "seed"],
  },

  // ── Text-to-Video ────────────────────────────────────────────────────
  {
    id: "sora/v2/text-to-video",
    name: "Sora v2",
    kind: "text-to-video",
    description: "OpenAI Sora v2 text-to-video.",
    params: ["prompt", "duration", "resolution", "seed"],
  },
  {
    id: "veo3/text-to-video",
    name: "Veo 3",
    kind: "text-to-video",
    description: "Google Veo 3 text-to-video with audio.",
    params: ["prompt", "duration", "seed"],
  },
  {
    id: "kling/v2.1/text-to-video/standard",
    name: "Kling 2.1 Text-to-Video Standard",
    kind: "text-to-video",
    description: "Kling 2.1 text-to-video standard mode.",
    params: ["prompt", "duration", "seed"],
  },
  {
    id: "kling/v2.1/text-to-video/pro",
    name: "Kling 2.1 Text-to-Video Pro",
    kind: "text-to-video",
    description: "Kling 2.1 text-to-video pro mode.",
    params: ["prompt", "duration", "seed"],
  },
  {
    id: "seedance/v1/text-to-video/lite",
    name: "Seedance v1 Text-to-Video Lite",
    kind: "text-to-video",
    description: "ByteDance Seedance v1 Lite text-to-video.",
    params: ["prompt", "seed"],
  },
  {
    id: "seedance/v1/text-to-video/pro",
    name: "Seedance v1 Text-to-Video Pro",
    kind: "text-to-video",
    description: "ByteDance Seedance v1 Pro text-to-video.",
    params: ["prompt", "seed"],
  },
  {
    id: "wan/v2.1/text-to-video/480p",
    name: "Wan 2.1 Text-to-Video 480p",
    kind: "text-to-video",
    description: "Wan 2.1 text-to-video at 480p.",
    params: ["prompt", "seed"],
  },
  {
    id: "wan/v2.1/text-to-video/720p",
    name: "Wan 2.1 Text-to-Video 720p",
    kind: "text-to-video",
    description: "Wan 2.1 text-to-video at 720p.",
    params: ["prompt", "seed"],
  },

  // ── Speech-to-Video ──────────────────────────────────────────────────
  {
    id: "v1/speak/higgsfield",
    name: "Higgsfield Speech-to-Video",
    kind: "speech-to-video",
    description: "Animate a portrait image to speak from an audio file (talking head).",
    params: ["image_url", "audio_url", "prompt"],
  },
];

export function findModel(modelId) {
  return MODELS.find((m) => m.id === modelId);
}

export function filterModels(kind) {
  if (!kind) return MODELS;
  return MODELS.filter((m) => m.kind === kind);
}
