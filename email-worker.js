// Cloudflare Email Worker for MailVoid
// This worker forwards incoming emails to the MailVoid API for processing
export default {
  async email(message, env, ctx) {

    // Example: forward to another service
    await fetch('https://mailvoid.win/api/endpoint', {
      method: "POST",
      headers: {
        'Content-Type': 'message/rfc822',
        'X-From': message.from,
        'X-To': JSON.stringify(message.to),
      },
      body: message.raw,
    });
  }
};