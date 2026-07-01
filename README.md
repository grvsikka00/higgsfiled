# higgsfiled

Higgsfield API integration.

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env` with your Higgsfield credentials from https://cloud.higgsfield.ai/ — either
`HF_CREDENTIALS=KEY_ID:KEY_SECRET`, or `HF_API_KEY` / `HF_API_SECRET` separately.

## Test the connection

```bash
npm run test:connection
```

This calls `getMotions()`, a lightweight authenticated read, to confirm the credentials and
network path to `https://platform.higgsfield.ai` work without triggering a paid generation.
