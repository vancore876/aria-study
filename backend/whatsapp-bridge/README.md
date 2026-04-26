# ARIA WhatsApp Bridge

This is a starter backend for Meta WhatsApp Cloud API webhooks.

## What it does
- verifies the webhook challenge
- receives inbound WhatsApp messages
- forwards the message payload to your ARIA backend endpoint
- sends the ARIA reply back through WhatsApp Cloud API

## Before use
1. Create a Meta developer app with WhatsApp Cloud API.
2. Configure your webhook URL to point to this server.
3. Copy `.env.example` to `.env` and fill in your values.
4. Implement your ARIA reply endpoint or replace the forwarding logic.

## Start
```bash
npm install
npm run dev
```

## Note
This backend is intentionally simple and not production hardened. Add auth, queueing, retries, persistence, and signature validation before using it for real users.
