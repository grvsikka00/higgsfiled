# Higgsfield MCP Server

MCP server that connects Claude to [Higgsfield AI](https://higgsfield.ai) for AI image and video generation.

## Tools

| Tool | Description |
|------|-------------|
| `list_models` | Browse 22+ models (filter by kind) |
| `get_balance` | Check API credit balance |
| `generate_image` | Text-to-image (Flux Pro, Seedream, Soul, …) |
| `generate_video` | Text/image-to-video (Sora v2, Veo 3, Kling 3, DOP, …) |
| `generate_speech_video` | Talking-head portrait animation |
| `get_job_status` | Poll or wait for a job to complete |
| `cancel_job` | Cancel a queued/running job |
| `list_jobs` | Browse generation history |
| `upload_image` | Upload base64 image → CDN URL |
| `list_soul_characters` | List saved Soul character references |
| `create_soul_character` | Create a new Soul character |
| `delete_soul_character` | Delete a Soul character |
| `list_motions` | Browse DOP motion presets |
| `list_soul_styles` | Browse Soul style presets |

## Setup

### 1. Get credentials

Sign up at [higgsfield.ai](https://higgsfield.ai), generate an API key, and note your **Key ID** and **Key Secret**.

### 2. Install dependencies

```bash
npm install
```

### 3a. Claude Code (local)

Add to your project's `.claude/settings.json` (already done in this repo — just fill in your credentials):

```json
{
  "mcpServers": {
    "higgsfield": {
      "command": "node",
      "args": ["src/index.js"],
      "env": {
        "HF_CREDENTIALS": "YOUR_KEY_ID:YOUR_KEY_SECRET"
      }
    }
  }
}
```

### 3b. Claude Code on the web

Add `platform.higgsfield.ai` to your **Network egress allowlist** in the environment settings at [code.claude.com](https://code.claude.com), then the MCP server in `.claude/settings.json` will connect automatically.

### 3c. Claude Desktop

Merge this into `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "higgsfield": {
      "command": "node",
      "args": ["/absolute/path/to/higgsfiled/src/index.js"],
      "env": {
        "HF_CREDENTIALS": "YOUR_KEY_ID:YOUR_KEY_SECRET"
      }
    }
  }
}
```

Restart Claude Desktop after saving.

## Authentication

Set credentials via one of:

```bash
# Option A – combined (recommended)
HF_CREDENTIALS=KEY_ID:KEY_SECRET

# Option B – separate vars
HF_API_KEY_ID=KEY_ID
HF_API_KEY_SECRET=KEY_SECRET
```

## Example usage

Once connected, ask Claude:

- *"List all available Higgsfield video models"*
- *"Generate an image of a futuristic city at sunset using Flux Pro"*
- *"Animate this image URL into a video using the DOP model"*
- *"Check the status of job abc-123"*
- *"What's my Higgsfield credit balance?"*