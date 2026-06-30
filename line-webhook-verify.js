// Code Node 1: "Verify Signature & Extract Image Events"

const crypto = require('crypto');

const channelSecret = $env.LINE_CHANNEL_SECRET;

// require option "Row Body" in Webhook Trigger node
// note: this is a workaround for n8n not providing raw body in webhook trigger node
const rawBodyBuffer = await this.helpers.getBinaryDataBuffer(0, 'data');
const rawBody = rawBodyBuffer.toString('utf8');

const signature = $input.first().json.headers['x-line-signature'];

const hash = crypto
  .createHmac('SHA256', channelSecret)
  .update(rawBody)
  .digest('base64');

if (hash !== signature) {
  throw new Error('Invalid LINE signature — request not from LINE platform');
}

// Parse the raw body to JSON and extract events
const body = JSON.parse(rawBody);
const events = body.events || [];

// Filter events to only include image messages
const imageEvents = events.filter(
  (e) => e.type === 'message' && e.message.type === 'image'
);

// Map the filtered image events to a structured format for further processing
return imageEvents.map((e) => ({
  json: {
    record_id: crypto.randomUUID(),
    line_message_id: e.message.id,
    line_user_id: e.source.userId,
    image_message_id: e.message.id,
    replyToken: e.replyToken,
    recorded_at: new Date().toISOString(),
    // Include imageSetId if available, otherwise set to null
    imageSetId: e.message.imageSet ? e.message.imageSet.id : null,
    message_type: e.message.type,
  },
}));