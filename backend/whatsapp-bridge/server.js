import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const PORT = Number(process.env.PORT || 8787);
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || '';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const ARIA_FORWARD_URL = process.env.ARIA_FORWARD_URL || '';

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'aria-whatsapp-bridge' });
});

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

async function forwardToARIA(incomingText, from) {
  if (!ARIA_FORWARD_URL) {
    return `ARIA bridge received: ${incomingText}`;
  }

  const response = await axios.post(ARIA_FORWARD_URL, {
    channel: 'whatsapp',
    from,
    text: incomingText,
  }, {
    timeout: 30000,
  });

  return response.data?.reply || 'ARIA did not return a reply.';
}

async function sendWhatsAppText(to, body) {
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    throw new Error('Missing WhatsApp Cloud API credentials in .env');
  }

  await axios.post(
    `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    },
    {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );
}

app.post('/webhook', async (req, res) => {
  res.sendStatus(200);

  try {
    const changes = req.body?.entry?.[0]?.changes?.[0]?.value;
    const message = changes?.messages?.[0];
    const from = message?.from;
    const text = message?.text?.body;

    if (!from || !text) return;

    const reply = await forwardToARIA(text, from);
    await sendWhatsAppText(from, reply);
  } catch (error) {
    console.error('[ARIA WhatsApp bridge] webhook error:', error?.response?.data || error.message || error);
  }
});

app.listen(PORT, () => {
  console.log(`[ARIA WhatsApp bridge] listening on :${PORT}`);
});
