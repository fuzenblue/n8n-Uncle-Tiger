// Code Node 1: "Verify Signature & Extract Image Events"

const crypto = require('crypto');

const channelSecret = $env.LINE_CHANNEL_SECRET;

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

const body = JSON.parse(rawBody);
const events = body.events || [];

const messageEvents = events.filter(e => e.type === 'message');

return messageEvents.map((e) => ({
  json: {
    record_id: crypto.randomUUID(),
    line_message_id: e.message.id,
    line_user_id: e.source.userId,
    replyToken: e.replyToken,
    recorded_at: new Date().toISOString(),
    message_type: e.message.type,
    text: e.message.type === 'text' ? e.message.text : null, 
  },
}));